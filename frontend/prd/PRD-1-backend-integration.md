# PRD-1: Integración Backend — Todos los botones funcionan

**Rama:** `feature/prd1-backend-full`  
**Prioridad:** CRÍTICA  
**Objetivo:** Conectar cada pantalla del frontend con el backend real. Cero mocks, cero `setTimeout` falsos.

---

## Estado actual (qué está roto)

| Pantalla | Botón / Acción | Estado actual | Lo que debe hacer |
|---|---|---|---|
| RegisterScreen | "Continuar con Google/Apple/LinkedIn" | Fake — pone email inventado | Supabase OAuth real |
| RegisterScreen | "Crear cuenta" (email) | `setTimeout` mock, no crea usuario | Supabase `signUp` real |
| MentorScreen (Copilot) | "Enviar mensaje" | `setTimeout(1500)` — respuesta inventada | POST `/api/v1/copilot/message` |
| MatchScreen | Cards de trabajo | Hardcoded: 1 job estático | GET `/api/v1/jobs/` desde Supabase |
| MatchScreen | Like / Superlike / Reject | Solo animación, no persiste | Guardar acción en Supabase |
| SimulationScreen | "Iniciar simulación" | Preguntas hardcodeadas | POST `/api/v1/simulations/` + preguntas IA |
| InterviewScreen | "Comenzar entrevista" | Timer visual, sin video real | WebRTC + captura + `/api/v1/video-analysis/analyze` |
| InterviewScreen | "Finalizar" | Navega a report con datos falsos | PATCH simulation con resultado real |
| ReportScreen | Scores (confianza, etc.) | Datos hardcodeados | Leer resultado real de la simulación |
| ProfileScreen | Datos del perfil | `userData` del estado local | GET perfil desde Supabase |

---

## Arquitectura de la solución

```
Frontend (Next.js 15)          Backend (FastAPI)          Supabase
       │                              │                      │
RegisterScreen ──signUp/OAuth──► auth.users ◄──────────────►│
       │                              │                      │
MatchScreen ──GET /jobs/──────────────►jobs table ◄─────────►│
       │                              │                      │
MentorScreen ──POST /copilot/──────────►OpenAI GPT-4o-mini   │
       │                              │   └─persist session──►│
SimulationScreen ──POST /simulations/──►simulations table ◄──►│
       │                              │                      │
InterviewScreen ──POST /video-analysis/►OpenAI GPT-4o Vision │
       │                              │                      │
ReportScreen ◄──GET /simulations/id───►simulations table ◄───►│
```

---

## Módulos a implementar

### M1 — Auth (Supabase directo desde frontend)
**Archivo:** `frontend/modules/auth/actions.ts` (ya existe pero no conectado a UI)

- `signUp(email, password, name, userType)` → `supabase.auth.signUp` + insert en `profiles`
- `signIn(email, password)` → `supabase.auth.signInWithPassword`
- `signInWithOAuth(provider: 'google' | 'apple' | 'linkedin_oidc')` → `supabase.auth.signInWithOAuth`
- `getSession()` → devuelve sesión activa
- `signOut()` → `supabase.auth.signOut`

**RegisterScreen** debe importar y llamar estas actions.

---

### M2 — Jobs (Match screen)
**Archivo:** `frontend/modules/jobs/queries.ts` (ya existe)

- `getJobs()` → GET `/api/v1/jobs/` con el JWT del usuario
- Conectar a `MatchScreen` para reemplazar el array hardcodeado
- `saveJobAction(jobId, action: 'like'|'superlike'|'reject')` → insert en tabla `job_actions` (nueva)

**Migración nueva:** `frontend/supabase/migrations/008_job_actions.sql`

---

### M3 — Copilot / Mentor
**Archivo:** `frontend/modules/copilot/` (nuevo)

- `sendMessage(message, sessionId?)` → POST `/api/v1/copilot/message` con JWT
- Devuelve `{ session_id, reply }`
- `MentorScreen` importa este hook y reemplaza el `setTimeout` fake

---

### M4 — Simulación
**Archivos:** `frontend/modules/simulator/actions.ts` (existe), `backend/app/api/v1/routes/simulations.py`

Ampliar backend:
- `POST /api/v1/simulations/` ya existe → crear simulación
- `POST /api/v1/simulations/{id}/questions` → **nuevo** — genera 5 preguntas con GPT-4o-mini según el job
- `PATCH /api/v1/simulations/{id}/result` → guardar análisis final

`SimulationScreen` debe:
1. Crear simulación en backend al "Iniciar"
2. Obtener preguntas IA (no hardcodeadas)
3. Guardar resultado al terminar

---

### M5 — Entrevista con video
**Archivo:** `frontend/modules/video-analysis/` (nuevo)

- Captura frames del webcam cada 5s con `getUserMedia` + `canvas.toBlob`
- POST frame a `/api/v1/video-analysis/analyze` con JWT
- Acumula scores: `confidence`, `eye_contact`, `body_language`
- Al finalizar: PATCH simulation con el análisis acumulado

---

### M6 — Reporte
**Archivo:** `frontend/components/skillmatch/report-screen.tsx`

- Recibe `simulationId` por prop (desde `InterviewScreen` al navegar)
- GET `/api/v1/simulations/{id}` → lee scores reales
- Muestra el análisis real del backend

---

### M7 — Backend config y CORS
**Archivos:** `backend/.env`, `backend/app/core/config.py`

- Crear `backend/.env.example` con todas las variables
- Actualizar `ALLOWED_ORIGINS` para incluir `localhost:3001` y dominio de Vercel
- Crear `backend/requirements.txt` con todas las dependencias

---

## Orden de implementación

```
1. M7 — Backend config (desbloquea todo lo demás)
2. M1 — Auth (RegisterScreen funciona)
3. M2 — Jobs (MatchScreen con datos reales)
4. M3 — Copilot (MentorScreen funciona)
5. M4 — Simulación (SimulationScreen con preguntas IA)
6. M5 — Video análisis (InterviewScreen real)
7. M6 — Reporte (ReportScreen con datos reales)
```

---

## Cambios en el schema de Supabase

### Tabla nueva: `job_actions`
```sql
CREATE TABLE job_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  action TEXT CHECK (action IN ('like', 'superlike', 'reject')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);
```

### Columnas nuevas en `simulations`
```sql
ALTER TABLE simulations
  ADD COLUMN IF NOT EXISTS questions JSONB,
  ADD COLUMN IF NOT EXISTS video_scores JSONB,
  ADD COLUMN IF NOT EXISTS overall_score INTEGER;
```

---

## Criterios de aceptación

- [ ] Crear cuenta con email → usuario aparece en Supabase Auth
- [ ] Login con Google → redirige y autentica correctamente
- [ ] Match screen muestra jobs reales de la DB
- [ ] Like/Superlike/Reject persiste en `job_actions`
- [ ] Mentor responde con GPT-4o-mini en < 3s
- [ ] Simulación genera preguntas IA según el job seleccionado
- [ ] Entrevista captura video y envía frames al backend
- [ ] Reporte muestra scores reales del análisis de video
- [ ] Backend corre con `uvicorn` sin errores
- [ ] `npm run dev` desde raíz levanta ambos (frontend + backend)
