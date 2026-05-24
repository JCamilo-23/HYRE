# PRD-2: Registro y persistencia de perfiles de usuario

**Rama:** `feature/prd2-user-profiles`  
**Prioridad:** CRÍTICA  
**Objetivo:** Guardar correctamente en base de datos quién entra a la plataforma — jóvenes (candidatos) y negocios (empresas) — con sus datos específicos por rol, desde el momento del registro.

---

## Problema actual (qué está roto)

| # | Problema | Impacto |
|---|---|---|
| 1 | El trigger `handle_new_user` **no guarda el `role`** desde `raw_user_meta_data` — todos quedan como `candidate` por defecto | No sé si quien entró es joven o negocio |
| 2 | No existe tabla diferenciada para datos de candidato (habilidades, carrera) ni de negocio (empresa, industria, tamaño) | No puedo personalizar la experiencia ni filtrar |
| 3 | El signup envía el `role` en metadata pero nunca llega a la BD | El rol se pierde en el aire |
| 4 | No hay endpoint en el backend para leer/actualizar el perfil extendido | El frontend no puede mostrar ni editar datos del usuario |
| 5 | El enum usa `recruiter` pero la lógica de negocio dice "negocios" — inconsistencia conceptual | Confusión en código y futuras queries |

---

## Arquitectura de la solución

```
Frontend (Next.js 15)              Supabase                     Backend (FastAPI)
       │                              │                               │
signUp(email, pass, name, role) ──►  auth.users                      │
       │                             │  └── trigger handle_new_user   │
       │                             │         └── profiles (con role) │
       │                             │                                │
onboarding joven ────────────────►   candidate_profiles               │
onboarding negocio ──────────────►   business_profiles                │
       │                             │                                │
GET /profile ────────────────────────────────────────────────────►    │
       │                             │               └── profiles + perfil extendido
```

---

## Base de datos — Migraciones

### Migración 009: Arreglar trigger + renombrar rol

```sql
-- 009_fix_user_role_trigger.sql

-- 1. Agregar el valor 'business' al enum existente
alter type user_role add value 'business';

-- 2. Reparar el trigger para que guarde el rol
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    coalesce(
      (new.raw_user_meta_data->>'role')::user_role,
      'candidate'
    )
  );
  return new;
end;
$$ language plpgsql security definer;
```

### Migración 010: Tabla candidate_profiles

```sql
-- 010_candidate_profiles.sql

create table public.candidate_profiles (
  id            uuid references public.profiles(id) on delete cascade primary key,
  birth_year    int,                          -- para saber si es Gen Z
  city          text,
  career_stage  text,                         -- 'estudiante' | 'recien_graduado' | 'con_experiencia'
  skills        text[]   default '{}',        -- ['JavaScript', 'Python', ...]
  cv_url        text,                         -- URL al CV subido
  linkedin_url  text,
  bio           text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.candidate_profiles enable row level security;

create policy "Candidato ve su propio perfil"
  on public.candidate_profiles for select
  using (auth.uid() = id);

create policy "Candidato actualiza su propio perfil"
  on public.candidate_profiles for update
  using (auth.uid() = id);

create policy "Negocios pueden ver candidatos"
  on public.candidate_profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'business'
    )
  );

-- Auto-crear fila vacía cuando se registra un candidato
create or replace function public.handle_new_candidate()
returns trigger as $$
begin
  if new.role = 'candidate' then
    insert into public.candidate_profiles (id) values (new.id);
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_candidate_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_candidate();
```

### Migración 011: Tabla business_profiles

```sql
-- 011_business_profiles.sql

create table public.business_profiles (
  id              uuid references public.profiles(id) on delete cascade primary key,
  company_name    text not null,
  industry        text,                        -- 'tech' | 'retail' | 'salud' | etc.
  company_size    text,                        -- '1-10' | '11-50' | '51-200' | '200+'
  city            text,
  website_url     text,
  nit             text,                        -- identificación tributaria (Colombia)
  description     text,
  logo_url        text,
  verified        boolean not null default false,  -- verificación manual futura
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.business_profiles enable row level security;

create policy "Negocio ve su propio perfil"
  on public.business_profiles for select
  using (auth.uid() = id);

create policy "Negocio actualiza su propio perfil"
  on public.business_profiles for update
  using (auth.uid() = id);

create policy "Candidatos pueden ver negocios"
  on public.business_profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'candidate'
    )
  );

-- Auto-crear fila vacía cuando se registra un negocio
create or replace function public.handle_new_business()
returns trigger as $$
begin
  if new.role = 'business' then
    insert into public.business_profiles (id, company_name)
    values (new.id, coalesce(new.full_name, 'Mi empresa'));
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_business_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_business();
```

---

## Frontend — Módulo auth

### Cambios en `modules/auth/types.ts`

```ts
export type UserRole = "candidate" | "business"   // recruiter → business

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface CandidateProfile {
  id: string
  birth_year: number | null
  city: string | null
  career_stage: "estudiante" | "recien_graduado" | "con_experiencia" | null
  skills: string[]
  cv_url: string | null
  linkedin_url: string | null
  bio: string | null
}

export interface BusinessProfile {
  id: string
  company_name: string
  industry: string | null
  company_size: "1-10" | "11-50" | "51-200" | "200+" | null
  city: string | null
  website_url: string | null
  nit: string | null
  description: string | null
  logo_url: string | null
  verified: boolean
}

export interface FullProfile extends Profile {
  candidate_profile?: CandidateProfile | null
  business_profile?: BusinessProfile | null
}
```

### Cambios en `modules/auth/actions.ts`

- `signUp`: ya envía `role` en metadata — no cambia, el trigger ahora sí lo lee
- Agregar `getFullProfile()` — devuelve `profiles` + el sub-perfil según rol
- Agregar `updateCandidateProfile(data: Partial<CandidateProfile>)`
- Agregar `updateBusinessProfile(data: Partial<BusinessProfile>)`

### Cambios en `modules/auth/queries.ts`

```ts
// getFullProfile — une profiles con la tabla extendida según rol
export async function getFullProfile(supabase, userId: string): Promise<FullProfile | null>

// getCandidateProfile
export async function getCandidateProfile(supabase, userId: string): Promise<CandidateProfile | null>

// getBusinessProfile
export async function getBusinessProfile(supabase, userId: string): Promise<BusinessProfile | null>
```

---

## Backend — Nuevos endpoints

### `GET /api/v1/profile/me`
Devuelve el perfil completo del usuario autenticado (base + extendido según rol).

```json
// Respuesta candidato
{
  "id": "uuid",
  "email": "...",
  "full_name": "...",
  "role": "candidate",
  "candidate_profile": {
    "birth_year": 2001,
    "city": "Barranquilla",
    "career_stage": "recien_graduado",
    "skills": ["React", "Node.js"]
  }
}

// Respuesta negocio
{
  "id": "uuid",
  "email": "...",
  "full_name": "...",
  "role": "business",
  "business_profile": {
    "company_name": "TechCo SAS",
    "industry": "tech",
    "company_size": "11-50",
    "verified": false
  }
}
```

### `PATCH /api/v1/profile/me`
Actualiza datos del sub-perfil según el rol del usuario autenticado.

---

## Flujo de onboarding post-registro

Después del `signUp` exitoso, redirigir a `/onboarding` en vez de `/`:

**Joven (candidate):**
1. "¿En qué ciudad estás?" → `city`
2. "¿Cuál es tu etapa profesional?" → `career_stage` (3 opciones)
3. "¿Qué habilidades tienes?" → `skills` (tags)
4. (Opcional) Subir CV → `cv_url`

**Negocio (business):**
1. "¿Nombre de tu empresa?" → `company_name`
2. "¿Industria?" → `industry` (selector)
3. "¿Tamaño de la empresa?" → `company_size` (4 opciones)
4. "¿Ciudad?" → `city`

Al completar onboarding → redirigir al dashboard correspondiente.

---

## Archivos a crear / modificar

| Archivo | Acción |
|---|---|
| `frontend/supabase/migrations/009_fix_user_role_trigger.sql` | Crear |
| `frontend/supabase/migrations/010_candidate_profiles.sql` | Crear |
| `frontend/supabase/migrations/011_business_profiles.sql` | Crear |
| `frontend/modules/auth/types.ts` | Modificar — agregar nuevos tipos |
| `frontend/modules/auth/actions.ts` | Modificar — `getFullProfile`, `updateCandidateProfile`, `updateBusinessProfile` |
| `frontend/modules/auth/queries.ts` | Modificar — queries para sub-perfiles |
| `frontend/app/onboarding/page.tsx` | Crear — flujo post-registro |
| `frontend/app/onboarding/_client.tsx` | Crear — componente cliente con pasos |
| `backend/app/api/v1/routes/profile.py` | Crear — endpoints `GET/PATCH /profile/me` |
| `backend/app/api/v1/schemas.py` | Modificar — schemas de perfil extendido |
| `backend/app/main.py` | Modificar — registrar nuevo router |

---

## Criterios de aceptación

- [ ] Al registrarse como joven, el campo `role` en `profiles` es `candidate`
- [ ] Al registrarse como negocio, el campo `role` en `profiles` es `business`
- [ ] Se crea automáticamente una fila en `candidate_profiles` o `business_profiles` según el rol
- [ ] `GET /api/v1/profile/me` devuelve perfil completo con sub-perfil incluido
- [ ] El flujo de onboarding completa los datos del sub-perfil y redirige al dashboard correcto
- [ ] Un negocio NO puede ver datos privados de otro negocio
- [ ] Un candidato puede ver perfiles públicos de negocios (para ver quién publicó una oferta)
- [ ] Los tipos TypeScript están sincronizados con la estructura real de la BD
