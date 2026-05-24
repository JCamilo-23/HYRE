# PRD-004 — Separación de Roles, Estadísticas Reales y Nova CV en Widget Flotante

**Versión:** 1.0  
**Fecha:** 2026-05-24  
**Estado:** Aprobado para implementación  
**Autor:** Equipo Hyre  

---

## 1. Contexto y Problema

### Estado actual (problemas identificados)

| # | Problema | Impacto |
|---|---|---|
| 1 | Estadísticas 100% hardcodeadas (XP, nivel, matches, score) | Datos falsos = cero valor real para el usuario |
| 2 | Rol `business` ve la misma UI que candidatos (Nova AI, CV, etc.) | Experiencia confusa, features irrelevantes |
| 3 | Subir CV solo disponible desde la pantalla completa de Nova | Fricción innecesaria, flujo largo |
| 4 | Widget flotante de Nova solo tiene chat, no permite acción de CV | Desaprovecha la superficie más accesible de la app |
| 5 | Sin tabla de matches reales en DB | Impossible calcular afinidad candidato↔empresa |
| 6 | Bottom nav es idéntica para candidatos y empresas | UX incoherente con el rol del usuario |

---

## 2. Objetivos

1. **Separación de roles**: La UI de candidato y empresa son completamente distintas — sin cross-contamination.
2. **Estadísticas reales**: Toda cifra que el usuario vea (XP, matches, score, etc.) proviene de la DB, no de código hardcodeado.
3. **Nova CV desde el widget flotante**: El candidato puede subir y ver su CV desde el panel flotante sin navegar a otra pantalla.
4. **Zero errores TypeScript**: El código resultante pasa `tsc --noEmit` limpio.
5. **Sin romper lógica existente**: Auth, trigger, onboarding, simulación, chat Nova — todo sigue funcionando.

---

## 3. Alcance

### IN SCOPE
- Separación completa de UI candidato vs empresa (home, bottom nav, Nova widget)
- Nueva tabla `job_matches` en DB
- Columnas `xp`, `level`, `nova_cv_score` en `candidate_profiles`
- API routes para estadísticas reales (candidato y empresa)
- Widget flotante Nova con tabs Chat / Mi CV (solo para candidatos)
- Home screen del candidato con datos reales
- Home screen del empresa con datos reales (jobs activos, candidatos, matches)
- Bottom nav diferenciada por rol

### OUT OF SCOPE (este PRD)
- Algoritmo de matching complejo (se usa score manual en esta fase)
- Notificaciones push
- Stripe / billing
- Sistema de entrevistas en video
- Chat entre candidato y empresa

---

## 4. Roles de Usuario

### Candidato (`role = 'candidate'`)
- Sube y analiza su CV con Nova AI
- Ve matches con empresas
- Practica simulaciones
- Accede al chat mentor de Nova
- Ve sus estadísticas: XP, nivel, score CV, matches

### Empresa (`role = 'business'`)
- Gestiona sus vacantes
- Ve candidatos que matchean con sus vacantes
- Ve estadísticas: vacantes activas, candidatos match, tasa de respuesta
- **NO VE**: Nova CV, chat mentor IA, simulaciones candidato

---

## 5. Base de Datos — Cambios Requeridos

### Migration 013: Stats y Matches

```sql
-- 013_stats_and_matches.sql

-- ─── 1. Enriquecer candidate_profiles ────────────────────────────────────────
ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS xp            INT         NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level         INT         NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS nova_cv_score INT,          -- último score general del CV (0–100)
  ADD COLUMN IF NOT EXISTS simulations_completed INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS profile_completeness  INT NOT NULL DEFAULT 0; -- % completado perfil

-- ─── 2. Tabla job_matches ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.job_matches (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id         UUID        REFERENCES public.jobs(id)     ON DELETE CASCADE NOT NULL,
  candidate_id   UUID        REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  match_score    INT         NOT NULL CHECK (match_score BETWEEN 0 AND 100),
  status         TEXT        NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'candidate_liked', 'company_liked', 'mutual', 'rejected')),
  candidate_note TEXT,
  company_note   TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (job_id, candidate_id)
);

ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;

-- Candidatos ven sus propios matches
CREATE POLICY "Candidato ve sus matches"
  ON public.job_matches FOR SELECT
  USING (auth.uid() = candidate_id);

-- Candidatos pueden actualizar su estado (like/pass)
CREATE POLICY "Candidato actualiza su match"
  ON public.job_matches FOR UPDATE
  USING (auth.uid() = candidate_id);

-- Empresas ven matches de sus vacantes
CREATE POLICY "Empresa ve matches de sus vacantes"
  ON public.job_matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_id AND jobs.company_id = auth.uid()
    )
  );

-- Empresas actualizan estado de sus matches
CREATE POLICY "Empresa actualiza match de sus vacantes"
  ON public.job_matches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_id AND jobs.company_id = auth.uid()
    )
  );

CREATE INDEX job_matches_candidate_idx ON public.job_matches (candidate_id);
CREATE INDEX job_matches_job_idx       ON public.job_matches (job_id);
CREATE INDEX job_matches_status_idx    ON public.job_matches (status);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_job_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_matches_updated_at
  BEFORE UPDATE ON public.job_matches
  FOR EACH ROW EXECUTE FUNCTION public.set_job_matches_updated_at();

-- ─── 3. Función: calcular nivel desde XP ─────────────────────────────────────
-- Niveles: 1→0 XP, 2→500, 3→1500, 4→3500, 5→7000, 6→12000, 7→20000
CREATE OR REPLACE FUNCTION public.xp_to_level(xp_val INT)
RETURNS INT AS $$
BEGIN
  RETURN CASE
    WHEN xp_val < 500   THEN 1
    WHEN xp_val < 1500  THEN 2
    WHEN xp_val < 3500  THEN 3
    WHEN xp_val < 7000  THEN 4
    WHEN xp_val < 12000 THEN 5
    WHEN xp_val < 20000 THEN 6
    ELSE 7
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ─── 4. Trigger: sincronizar nova_cv_score cuando nova_analyses se inserta ───
CREATE OR REPLACE FUNCTION public.sync_nova_cv_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.candidate_profiles
  SET nova_cv_score = NEW.score_general
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER nova_analyses_sync_score
  AFTER INSERT ON public.nova_analyses
  FOR EACH ROW EXECUTE FUNCTION public.sync_nova_cv_score();
```

### Reglas de migración
- Aplicar con `npx supabase db query --linked --file supabase/migrations/013_stats_and_matches.sql`
- NO usar `supabase db push` (conflicto de versiones existente con migration 008 duplicado)

---

## 6. API Layer

### 6.1 `GET /api/stats/candidate`

**Auth:** Requerida (session de Supabase). Devuelve 401 si no autenticado.  
**Rol requerido:** `candidate`

**Respuesta:**
```typescript
{
  xp: number           // de candidate_profiles.xp
  level: number        // de candidate_profiles.level (o xp_to_level(xp))
  xp_next_level: number // XP necesario para siguiente nivel
  xp_progress_pct: number // % hacia siguiente nivel (0–100)
  nova_cv_score: number | null // último score general del CV
  matches_new: number  // job_matches WHERE status = 'pending' (nuevos sin ver)
  matches_mutual: number // job_matches WHERE status = 'mutual'
  simulations_active: number // work_simulator_sessions WHERE status = 'active'
  simulations_completed: number // candidate_profiles.simulations_completed
  profile_completeness: number // % completado (calculado)
  top_jobs: Array<{    // top 3 jobs activos con mayor match_score
    id: string
    title: string
    company_name: string
    industry: string
    match_score: number
    location: string | null
    remote: boolean
  }>
}
```

**Lógica de `profile_completeness`:**
```
puntos = 0
+ 20 si tiene city
+ 20 si tiene career_stage
+ 20 si skills.length > 2
+ 20 si nova_cv_score IS NOT NULL
+ 20 si bio IS NOT NULL
```

**Archivo:** `frontend/app/api/stats/candidate/route.ts`

---

### 6.2 `GET /api/stats/business`

**Auth:** Requerida. Rol `business`.

**Respuesta:**
```typescript
{
  jobs_active: number       // jobs WHERE company_id = uid AND status = 'active'
  jobs_total: number        // jobs WHERE company_id = uid
  candidates_matched: number // job_matches de sus vacantes, cualquier status ≠ rejected
  matches_mutual: number    // job_matches WHERE status = 'mutual'
  profile_completeness: number // % completado empresa
  recent_candidates: Array<{  // últimos 5 candidatos matched
    id: string
    full_name: string | null
    match_score: number
    skills: string[]
    city: string | null
    job_title: string
    match_status: string
    matched_at: string
  }>
}
```

**Archivo:** `frontend/app/api/stats/business/route.ts`

---

### 6.3 `GET /api/jobs/recommended`

Devuelve hasta 10 jobs activos ordenados por match_score desc para el candidato autenticado.  
Si no hay matches en DB, devuelve jobs aleatorios activos con `match_score: null`.

**Archivo:** `frontend/app/api/jobs/recommended/route.ts`

---

## 7. Arquitectura de Componentes Frontend

### 7.1 Flujo de resolución de rol

```
HyreApp (estado: userRole)
  ├── handleRegisterComplete → setUserRole basado en userType
  ├── Al autenticar existente → getProfile() → setUserRole(profile.role)
  └── Pasa userRole a todos los hijos que lo necesiten
```

`hyre-app.tsx` necesita:
```typescript
const [userRole, setUserRole] = useState<'candidate' | 'business' | null>(null)
```

Este valor viene de dos fuentes:
1. Registro nuevo: `userType === 'company' ? 'business' : 'candidate'`
2. Login existente: `profile.role` (fetch tras `onAuthStateChange`)

---

### 7.2 `NovaAppSync` — Ocultar Nova para empresas

```typescript
// Cambio en nova-root.tsx
interface NovaAppSyncProps {
  isOnboarded: boolean
  showBottomNav: boolean
  userName: string
  userRole: 'candidate' | 'business' | null  // NUEVO
}

// Nova SOLO visible para candidatos:
setVisible(isOnboarded && userRole === 'candidate')
```

---

### 7.3 `BottomNav` — Diferenciada por rol

**Nav candidato (actual, se mantiene):**
```
Home | Match | Simular | Nova CV | Perfil
```

**Nav empresa (nueva):**
```
Inicio | Candidatos | Vacantes | Perfil
```

Implementación:
```typescript
// bottom-nav.tsx
const candidateItems: NavItem[] = [
  { id: "home",       label: "Inicio",     icon: Home },
  { id: "match",      label: "Match",      icon: Target },
  { id: "simulation", label: "Simular",    icon: Sparkles },
  { id: "nova",       label: "Nova CV",    icon: FileText },
  { id: "profile",    label: "Perfil",     icon: User },
]

const businessItems: NavItem[] = [
  { id: "home",     label: "Inicio",      icon: Building2 },
  { id: "match",    label: "Candidatos",  icon: Users },
  { id: "jobs",     label: "Vacantes",    icon: Briefcase },
  { id: "profile",  label: "Empresa",     icon: User },
]

// BottomNav recibe `userRole` como prop
export function BottomNav({ currentScreen, onNavigate, userRole }: BottomNavProps)
```

---

### 7.4 Nova Widget Flotante — Tabs Chat / Mi CV

El widget flotante existente (`nova-widget.tsx` → `nova-chat-panel.tsx`) se amplía con un tab switcher.

**Solo visible para candidatos** (controlado por `NovaAppSync`).

#### 7.4.1 Nova Store — Nuevo estado

```typescript
// store/nova-store.ts — AÑADIR
activeTab: 'chat' | 'cv'
setActiveTab: (tab: 'chat' | 'cv') => void
```

#### 7.4.2 Nova Widget — Nueva estructura

```
NovaChatPanel (existente, sin modificar)
NovaCVPanel (nuevo componente: nova-cv-panel.tsx)
  └── Reutiliza: nova-cv-upload.tsx + nova-score-card.tsx

nova-widget.tsx
  └── NovaPanelShell (nuevo wrapper con tabs)
        ├── Tab "Chat"  → <NovaChatPanel />
        └── Tab "Mi CV" → <NovaCVPanel />
```

**Diseño del panel con tabs:**
```
┌─────────────────────────────────────┐
│ [✦ Nova]    [Chat] [Mi CV]      [×] │ ← Header con tabs
├─────────────────────────────────────┤
│                                     │
│  (contenido del tab activo)         │
│                                     │
│  Tab Chat → chat messages           │
│  Tab Mi CV → upload + scores        │
│                                     │
└─────────────────────────────────────┘
```

**Altura del panel:**
- Con tab Chat: `min(520px, calc(100dvh - 12rem))` (igual que hoy)
- Con tab Mi CV: `min(480px, calc(100dvh - 12rem))`

#### 7.4.3 `NovaCVPanel` — Especificación

```typescript
// components/nova/nova-cv-panel.tsx
// "use client"

// Estado: sin_cv | subiendo | analizando | con_resultado
// Si no hay CV subido: muestra drop zone compacta con CTA
// Si hay CV y análisis: muestra 5 barras de score (compactas)
//   + botón "Ver análisis completo" → onNavigate("nova")
// Reutiliza: uploadCV(), listCVs(), getAnalysis() de modules/nova/cv-service.ts
```

**Estados del panel Mi CV:**

| Estado | Qué muestra |
|---|---|
| `empty` | Drop zone compacta, ícono de PDF, texto "Sube tu CV para analizarlo" |
| `uploading` | Barra de progreso + "Subiendo..." |
| `analyzing` | Spinner + "Nova está analizando tu CV..." |
| `ready` | 5 mini score bars, score general en grande, botón "Ver detalle" |
| `error` | Mensaje de error + botón reintentar |

**Score bars compactas (adaptadas de nova-score-card.tsx):**
```
General   ████████░░ 82
ATS       ████████████ 91
Técnico   ██████░░░░ 67
Recruiter ███████░░░ 74
Visual    █████████░ 85
```

---

### 7.5 Home Screen Candidato — Estadísticas Reales

**Archivo:** `components/skillmatch/home-screen.tsx`

**Hook nuevo:** `useCandidateStats()`
```typescript
// modules/stats/hooks.ts
// "use client"
// Llama GET /api/stats/candidate
// Devuelve: { data, isLoading, error }
// SWR o fetch simple con useEffect
```

**Reemplazos de hardcoded → real:**

| Actual (hardcoded) | Real (desde DB) |
|---|---|
| `2,450 XP` | `stats.xp` formateado con separador de miles |
| `Nivel 3 - Rising Star` | `LEVEL_NAMES[stats.level]` (ver tabla abajo) |
| `70%` barra progreso | `stats.xp_progress_pct` |
| `2,450 / 3,500 XP` | `stats.xp / stats.xp_next_level` |
| `recommendedCompanies` hardcodeado | `stats.top_jobs` de la API |
| `2 retos pendientes` | `stats.simulations_active` |
| `3 nuevos` matches | `stats.matches_new` |
| `Score: 84` | `stats.nova_cv_score ?? '—'` |

**Tabla de nombres de nivel:**
```typescript
const LEVEL_NAMES: Record<number, string> = {
  1: "Newcomer",
  2: "Explorer",
  3: "Rising Star",
  4: "Pro",
  5: "Expert",
  6: "Master",
  7: "Legend",
}
```

**Skeleton Loading:** Mientras `isLoading`, mostrar skeletons animados en lugar de números. Usar `animate-pulse` de Tailwind.

**Error state:** Si la API falla, mostrar valores con `—` y un toast discreto. No bloquear la UI.

---

### 7.6 Home Screen Empresa (nuevo componente)

**Archivo:** `components/skillmatch/business-home-screen.tsx`

**Hook:** `useBusinessStats()`
```typescript
// modules/stats/hooks.ts
// "use client"
// Llama GET /api/stats/business
```

**Layout del Home empresa:**
```
┌─────────────────────────────────────┐
│ Buenos días, [NombreEmpresa]        │
│ [Vacantes activas badge]            │
├─────────────────────────────────────┤
│ Stats cards (2x2 grid):             │
│ [X Vacantes activas] [Y Candidatos] │
│ [Z Matches mutuos]  [W% Completado] │
├─────────────────────────────────────┤
│ Candidatos recientes match          │
│ [Avatar] [Nombre] [Score] [Skills]  │
│ ...                                 │
├─────────────────────────────────────┤
│ Quick actions:                      │
│ [+ Crear vacante] [Ver candidatos]  │
└─────────────────────────────────────┘
```

**Nota UX:** Si `jobs_active === 0`, mostrar un CTA prominente: "Publica tu primera vacante para empezar a recibir candidatos."

---

### 7.7 `HyreApp` — Orquestación de roles

```typescript
// hyre-app.tsx — CAMBIOS CLAVE

// 1. Nuevo estado
const [userRole, setUserRole] = useState<'candidate' | 'business' | null>(null)

// 2. Al completar registro
const handleRegisterComplete = (data: { name: string; email: string }) => {
  const role = userType === 'company' ? 'business' : 'candidate'
  setUserRole(role)
  // ...resto igual
}

// 3. Al navegar a home (usuario existente que ya tiene sesión)
//    Llamar getProfile() y setUserRole(profile.role) 

// 4. renderScreen() diferenciado:
case "home":
  return userRole === 'business'
    ? <BusinessHomeScreen onNavigate={setCurrentScreen} userData={userData} />
    : <HomeScreen onNavigate={setCurrentScreen} userData={userData} />

// 5. Nova solo visible para candidatos
<NovaAppSync
  isOnboarded={isOnboarded}
  showBottomNav={showBottomNav}
  userName={userData.name}
  userRole={userRole}  // NUEVO
/>

// 6. BottomNav recibe rol
{showBottomNav && (
  <BottomNav
    currentScreen={currentScreen}
    onNavigate={setCurrentScreen}
    userRole={userRole}  // NUEVO
  />
)}

// 7. showBottomNav — empresa NO ve Nova screen en bottom nav
const showBottomNav = isOnboarded && ![
  "userType", "register", "interview", "simulation"
].includes(currentScreen)
```

---

## 8. Módulo de Estadísticas

### Estructura de archivos nuevos

```
modules/
  stats/
    hooks.ts      ← useBusinessStats(), useCandidateStats()
    queries.ts    ← funciones de fetching puras
    types.ts      ← CandidateStats, BusinessStats
```

### `modules/stats/types.ts`
```typescript
export interface CandidateStats {
  xp: number
  level: number
  xp_next_level: number
  xp_progress_pct: number
  nova_cv_score: number | null
  matches_new: number
  matches_mutual: number
  simulations_active: number
  simulations_completed: number
  profile_completeness: number
  top_jobs: TopJob[]
}

export interface TopJob {
  id: string
  title: string
  company_name: string
  industry: string | null
  match_score: number
  location: string | null
  remote: boolean
}

export interface BusinessStats {
  jobs_active: number
  jobs_total: number
  candidates_matched: number
  matches_mutual: number
  profile_completeness: number
  recent_candidates: RecentCandidate[]
}

export interface RecentCandidate {
  id: string
  full_name: string | null
  match_score: number
  skills: string[]
  city: string | null
  job_title: string
  match_status: string
  matched_at: string
}
```

### `modules/stats/queries.ts`
```typescript
// Sin directivas — funciones puras que llaman /api/stats/*
export async function fetchCandidateStats(): Promise<CandidateStats> {
  const res = await fetch('/api/stats/candidate')
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function fetchBusinessStats(): Promise<BusinessStats> {
  const res = await fetch('/api/stats/business')
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
```

### `modules/stats/hooks.ts`
```typescript
"use client"

import { useEffect, useState } from "react"
import { fetchCandidateStats, fetchBusinessStats } from "./queries"
import type { CandidateStats, BusinessStats } from "./types"

export function useCandidateStats() {
  const [data, setData] = useState<CandidateStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    fetchCandidateStats()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [])

  return { data, isLoading, error }
}

export function useBusinessStats() {
  const [data, setData] = useState<BusinessStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    fetchBusinessStats()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [])

  return { data, isLoading, error }
}
```

---

## 9. UX / Design Guidelines

### Principios
1. **Role clarity first**: Un usuario empresarial nunca debe confundirse creyendo que es candidato. Headers y CTAs deben reflejar el rol.
2. **Data before pixels**: Ninguna cifra visible al usuario puede ser hardcodeada. Si no hay dato, mostrar `—` o un skeleton.
3. **Progressive disclosure**: En el widget flotante, el tab de CV muestra un resumen. El detalle completo está en la pantalla Nova.
4. **Feedback inmediato**: Cualquier acción (subir CV, hacer like a vacante) debe dar feedback visual en menos de 200ms.
5. **Consistencia de colores por rol**:
   - Candidato: primario `#7C3AED` (violeta), acento `#06B6D4` (cyan)
   - Empresa: primario `#0EA5E9` (azul), acento `#10B981` (verde)

### Loading states
- Usar `animate-pulse bg-[#1E293B] rounded` como skeleton genérico
- Mínimo: skeleton de mismas dimensiones que el dato real
- No usar spinners globales que bloqueen toda la pantalla

### Empty states
- **Candidato sin matches**: "Completa tu perfil para recibir matches" + botón a perfil
- **Candidato sin CV**: "Sube tu CV para que Nova lo analice" + CTA a widget Nova
- **Empresa sin vacantes**: "Crea tu primera vacante" + botón prominente
- **Empresa sin candidatos**: "Publica vacantes para atraer candidatos"

### Animaciones
- Usar las animaciones existentes de Framer Motion (no agregar nuevas librerías)
- Números que cambian: usar `animate-pulse` durante carga, sin animación de contador (puede fallar)
- Tabs del widget Nova: `AnimatePresence` con `mode="wait"` para transición suave

---

## 10. Reglas de Implementación (non-negotiable)

### TypeScript
- Todas las props con tipos explícitos (sin `any` en interfaces públicas)
- Los hooks de stats retornan `{ data: T | null, isLoading: boolean, error: string | null }`
- Las API routes retornan `NextResponse.json(data)` o `NextResponse.json({ error }, { status: N })`

### Supabase
- API routes usan `createClient()` de `lib/supabase/server.ts`
- Hooks de cliente usan `createClient()` de `lib/supabase/client.ts`
- **Siempre** usar `.maybeSingle()`, nunca `.single()` (lanza excepción si no hay resultado)
- RLS ya está activo en todas las tablas — las queries son inherentemente seguras por auth.uid()

### Componentes
- Los componentes de stats SON `"use client"` (usan hooks)
- Las `page.tsx` NO tienen `"use client"` (son Server Components)
- Si `BusinessHomeScreen` necesita datos, usar el hook `useBusinessStats()` internamente

### No romper
- `NovaChatPanel` — no modificar internamente, solo envolverlo en el tab shell
- `modules/nova/chat-service.ts` y `modules/nova/hooks.ts` — no tocar
- `modules/auth/actions.ts` y `hooks.ts` — no tocar (recién corregidos)
- `components/skillmatch/simulation-screen.tsx` — no tocar
- El trigger `handle_new_user` — no tocar (recién corregido)

### Supabase queries en API routes
```typescript
// Patrón correcto para stats:
const { data, error } = await supabase
  .from("candidate_profiles")
  .select("xp, level, nova_cv_score, simulations_completed")
  .eq("id", user.id)
  .maybeSingle()

if (error) {
  console.error("[stats/candidate]", error.message)
  return NextResponse.json({ error: "Error al cargar estadísticas" }, { status: 500 })
}
```

---

## 11. Plan de Implementación — Fases

### Fase 1: Base de Datos (sin UI, sin riesgo)
1. Crear `supabase/migrations/013_stats_and_matches.sql`
2. Aplicar con `npx supabase db query --linked --file`
3. Verificar con query de prueba que las columnas y tablas existen

### Fase 2: API Routes
4. `app/api/stats/candidate/route.ts`
5. `app/api/stats/business/route.ts`
6. `app/api/jobs/recommended/route.ts`
7. Testear cada endpoint con `curl` o Postman antes de conectar UI

### Fase 3: Módulo Stats
8. `modules/stats/types.ts`
9. `modules/stats/queries.ts`
10. `modules/stats/hooks.ts`

### Fase 4: Separación de roles (sin tocar stats aún)
11. `hyre-app.tsx` — agregar `userRole` state y lógica de branching
12. `nova-root.tsx` — recibir `userRole`, ocultar Nova si `business`
13. `bottom-nav.tsx` — recibir `userRole`, renderizar nav correcta
14. `business-home-screen.tsx` — crear componente con datos hardcodeados temporalmente

### Fase 5: Nova Widget con CV tab
15. `store/nova-store.ts` — agregar `activeTab`
16. `components/nova/nova-cv-panel.tsx` — crear panel compacto de CV
17. `components/nova/nova-widget.tsx` — agregar tab shell (sin modificar NovaChatPanel)

### Fase 6: Estadísticas reales
18. `home-screen.tsx` — reemplazar hardcoded con `useCandidateStats()`
19. `business-home-screen.tsx` — conectar con `useBusinessStats()`
20. Agregar skeletons y empty states

### Fase 7: QA
21. `npx tsc --noEmit` — cero errores
22. Probar flujo completo candidato: registro → home → stats → Nova CV widget
23. Probar flujo completo empresa: registro → home empresa → stats empresa → NO Nova
24. Verificar que `handle_new_user` trigger sigue funcionando
25. Verificar que onboarding sigue funcionando para ambos roles

---

## 12. Criterios de Aceptación

### Separación de roles
- [ ] Usuario con `role='business'` NO ve el widget flotante de Nova
- [ ] Usuario con `role='business'` NO ve "Nova CV" en bottom nav
- [ ] Usuario con `role='business'` ve bottom nav con: Inicio, Candidatos, Vacantes, Perfil
- [ ] Usuario con `role='candidate'` ve todo igual que hoy + CV en widget Nova
- [ ] El role se detecta correctamente tanto en registro nuevo como en login de usuario existente

### Estadísticas
- [ ] XP en home candidato proviene de `candidate_profiles.xp` (no hardcodeado)
- [ ] Nivel calculado con `xp_to_level()` desde la DB
- [ ] "X nuevos matches" cuenta registros reales en `job_matches`
- [ ] "X retos pendientes" cuenta `work_simulator_sessions` activos del usuario
- [ ] "Score: N" proviene de `nova_analyses.score_general` o `candidate_profiles.nova_cv_score`
- [ ] Recommended companies provienen de `jobs` + `business_profiles` (no array hardcodeado)
- [ ] Si el usuario no tiene datos, se muestran `—` o empty states (no 0 ni valores falsos)
- [ ] Estadísticas empresa provienen de `jobs` y `job_matches` reales

### Nova Widget CV tab
- [ ] Al abrir el widget Nova, hay dos tabs visibles: "Chat" y "Mi CV"
- [ ] Tab "Mi CV" muestra drop zone si no hay CV subido
- [ ] Tab "Mi CV" muestra scores si hay análisis
- [ ] Subir CV desde el widget funciona igual que desde la pantalla Nova
- [ ] El tab activo persiste mientras el widget está abierto (no se resetea)
- [ ] El widget NO muestra el tab "Mi CV" para usuarios empresa

### Código limpio
- [ ] `npx tsc --noEmit` pasa sin errores
- [ ] Ningún `any` en interfaces públicas
- [ ] Ningún valor estadístico hardcodeado en componentes de producción
- [ ] Todos los archivos existentes que NO debían tocarse permanecen sin cambios

---

## 13. Archivos a Crear / Modificar

### Crear (nuevos)
```
supabase/migrations/013_stats_and_matches.sql
app/api/stats/candidate/route.ts
app/api/stats/business/route.ts
app/api/jobs/recommended/route.ts
modules/stats/types.ts
modules/stats/queries.ts
modules/stats/hooks.ts
components/skillmatch/business-home-screen.tsx
components/nova/nova-cv-panel.tsx
```

### Modificar (existentes)
```
hyre-app.tsx           ← userRole state + branching
nova-root.tsx          ← recibir userRole
nova-store.ts          ← agregar activeTab
nova-widget.tsx        ← agregar tab shell
bottom-nav.tsx         ← recibir userRole, nav diferenciada
home-screen.tsx        ← reemplazar hardcoded con useCandidateStats()
```

### NO tocar
```
components/nova/nova-chat-panel.tsx
components/nova/nova-floating-bubble.tsx
components/nova/nova-cv-upload.tsx
components/nova/nova-score-card.tsx
modules/nova/*
modules/auth/*
components/skillmatch/simulation-screen.tsx
components/skillmatch/profile-screen.tsx
components/skillmatch/register-screen.tsx
app/onboarding/*
middleware.ts
lib/supabase/*
```

---

*Fin del PRD-004*
