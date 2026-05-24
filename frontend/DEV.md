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
