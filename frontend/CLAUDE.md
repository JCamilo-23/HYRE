# Hyre — Frontend (Next.js 15 + Supabase)

## Stack
- Next.js 15 (App Router, Turbopack)
- TypeScript strict
- Tailwind CSS
- Supabase (Auth + DB + Realtime)
- Zustand (UI state only)
- RecordRTC (video capture)

## Reglas críticas — leer antes de tocar código

### Componentes
- `page.tsx` = **siempre Server Component** (nunca "use client")
- Si una page necesita estado, crea `_client.tsx` al lado y renderízalo desde page.tsx
- Nunca importes hooks de React en `page.tsx`

### Supabase — 3 clientes distintos (NUNCA mezclar)
| Archivo | Dónde usar |
|---|---|
| `lib/supabase/client.ts` | Componentes cliente ("use client") |
| `lib/supabase/server.ts` | Server Components y Server Actions |
| `lib/supabase/middleware.ts` | Solo en `middleware.ts` de raíz |

### Módulos (`modules/X/`)
- `actions.ts` → siempre empieza con `"use server"`
- `hooks.ts` → siempre empieza con `"use client"`, maneja Realtime + estado local
- `queries.ts` → funciones puras que llaman a Supabase, sin directivas
- `types.ts` → interfaces del dominio (no en `types/`)
- `utils.ts` → funciones puras, sin efectos secundarios

### Freemium (`modules/freemium/gates.ts`)
- **TODA** lógica de límites va aquí: `canSimulate()`, `canAccessCopilot()`, `getRemainingUsage()`
- Nunca pongas lógica freemium en componentes directamente

### Store (`store/`)
- Solo estado UI: modales, sidebar, toasts
- **Nunca** datos del servidor en Zustand (eso va en Server Components o React Query)

### Paths (`@/`)
```ts
// Correcto
import { useAuth } from "@/modules/auth/hooks"
import { Button } from "@/components/ui/Button"
import { canSimulate } from "@/modules/freemium/gates"

// Incorrecto
import { useAuth } from "../../modules/auth/hooks"
```

## Estructura de carpetas

```
frontend/
├── app/                    # Routes (Server Components)
├── components/
│   ├── ui/                 # Primitivos: Button, Input, Card, Badge, Modal
│   ├── shared/             # Header, Sidebar, Footer, AuthGuard, ErrorBoundary
│   └── dashboard/          # StatCard, Chart, UserMetrics
├── hooks/                  # Hooks globales: useToast, useModal, useServiceWorker
├── lib/
│   ├── supabase/           # 3 clientes (client/server/middleware)
│   ├── api-client.ts       # fetch wrapper para /api/*
│   ├── env.ts              # validación de env vars
│   └── utils.ts            # cn(), formatters
├── modules/
│   ├── simulator/          # Simulación de entrevista con video
│   ├── jobs/               # Oferta de empleos y candidatos
│   ├── copilot/            # Práctica con IA
│   ├── video-analysis/     # Grabación + análisis facial
│   ├── auth/               # Login, registro, roles
│   ├── notifications/      # Push + email
│   ├── billing/            # Stripe + subscripción
│   └── freemium/           # Gates de acceso (leer antes de implementar features)
├── store/                  # Zustand — solo UI state
├── supabase/
│   ├── migrations/         # SQL migrations numeradas
│   └── seed.ts
├── types/
│   ├── database.ts         # Auto-generado de Supabase (no editar a mano)
│   └── index.ts            # Re-exports
├── docs/                   # Docs técnicos del proyecto
├── prd/                    # Product Requirements Documents
└── stitch/                 # HTML mockups (no va a producción)
```

## Comandos frecuentes

```bash
# Dev
npm run dev

# Supabase local
npx supabase start
npx supabase db reset

# Generar tipos de DB
npx supabase gen types typescript --local > types/database.ts

# Build
npm run build
```

## Convención de naming

- Componentes: PascalCase (`JobCard.tsx`)
- Hooks: camelCase con `use` prefix (`useJobList.ts`)
- Server Actions: camelCase verbo+objeto (`createJob`, `applyToJob`)
- Queries: camelCase get+entidad (`getJobs`, `getJobById`)
- Utils: camelCase descriptivo (`filterJobs`, `rankCandidates`)

## Colaboradores

- **Frontend (v0)**: `app/`, `components/`, módulos UI
- **Backend**: `modules/*/actions.ts`, `modules/*/queries.ts`, `supabase/migrations/`
- **No pisarse**: cada módulo es territorio propio — coordinar en PR si hay cambios cross-módulo
