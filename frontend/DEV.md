# HYRE Frontend — local development

## Start (correct)

From **repository root**:

```bash
npm install          # once, installs concurrently
npm run dev          # frontend :3000 + backend :8000
```

Or only frontend:

```bash
cd frontend
npm install
npm run dev -- -p 3000
```

## Do NOT run Next.js from repo root

The folder `/workspace/app` is legacy. Running `next dev` in the repo root serves the wrong app and breaks the landing/interview UI.

Always use `cd frontend` or `npm run dev` from root.

## Interview API

- UI: http://localhost:3000/interview
- Health: http://localhost:3000/api/interviews/health
- Backend direct: http://localhost:8000/health (JSON API, not a web UI)

## Gemini

Copy `.env.local.example` → `.env.local` and set `GEMINI_API_KEY`.

## Internal Server Error en `/interview`

Si ves **500 Internal Server Error**:

1. **Limpia la caché de Next** (causa habitual: `Cannot find module './vendor-chunks/next.js'`):
   ```bash
   cd frontend
   npm run dev:clean
   ```
2. Si el puerto 3000 sigue ocupado, cierra el proceso anterior o usa otro puerto:
   ```bash
   npm run dev:stable -- -p 3000
   ```
3. No ejecutes `next dev` desde la raíz del repo — solo desde `frontend/`.
4. Si usas Supabase en `.env.local`, comprueba que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` sean válidos (el middleware ignora errores, pero conviene corregirlos).

Tras limpiar `.next`, verifica:
- http://localhost:3000/interview → 200
- http://localhost:3000/interview/&lt;session-id&gt; → 200

## Si `/interview` sigue en 500

1. **Cierra todos los servidores Next** (a veces queda un `next-server` colgado en el puerto 3000):
   ```bash
   cd frontend
   npm run dev:clean
   ```
   El script `dev-with-recovery.mjs` libera el puerto 3000 y elimina `.next` corrupto automáticamente.

2. **Confirma que usas el puerto correcto** — si ves `Port 3000 is in use, using 3001`, abre http://localhost:3001/interview o mata el proceso en 3000.

3. **Error real en terminal** (causa raíz habitual):
   ```text
   ENOENT: .../app/interview/page/app-build-manifest.json
   ```
   → caché `.next` corrupta. `npm run dev:clean` lo resuelve.

4. Solo ejecuta Next desde `frontend/`, nunca desde la raíz del repo.
