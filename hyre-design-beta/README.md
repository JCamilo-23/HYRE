# HYRE Design Beta

Prototipo de diseño de HYRE — **solo UI**, sin Supabase, sin backend, sin APIs.

## Qué incluye

- **Landing page** (`/`) — marketing completo
- **App interactiva** (`/empezar`, `/app`) — flujo candidato y empresa
- Pantallas: registro, onboarding, match, simulador, entrevista, perfil, Nova, etc.
- Datos **mock** para explorar toda la interfaz sin configurar nada

## Requisitos

- Node.js 20+
- npm

## Inicio rápido

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

| Ruta | Contenido |
|------|-----------|
| `/` | Landing |
| `/empezar` | App HYRE (beta de diseño) |
| `/app` | Misma app |

## Notas

- El registro **no crea cuentas reales** — avanza directo al flujo de diseño
- Match, stats, Nova, CV y simulador usan **datos de ejemplo**
- La entrevista IA usa cámara local si la permites, pero la conversación es **simulada**

## Stack

Next.js 15 · React 19 · Tailwind CSS v4 · Framer Motion · Zustand
