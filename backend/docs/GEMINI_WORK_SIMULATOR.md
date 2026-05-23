# Integración Gemini — Simulador laboral

## Arquitectura

```
API (work_simulator.py)
    → WorkSimulatorUseCase (dominio)
        → AIChatService (puerto)
            → GeminiChatAdapter (infra)
                → GeminiClient (SDK Google)
        → Supabase (persistencia de sesiones)
```

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `GEMINI_API_KEY` | Clave desde [Google AI Studio](https://aistudio.google.com/apikey). **Solo backend.** |
| `GEMINI_MODEL` | Modelo rápido (copilot, visión). Default: `gemini-2.0-flash` |
| `GEMINI_PRO_MODEL` | Modelo para simulador laboral. Default: `gemini-1.5-pro` |

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/v1/work-simulator/sessions` | Crear sesión |
| `GET` | `/api/v1/work-simulator/sessions` | Listar sesiones del usuario |
| `GET` | `/api/v1/work-simulator/sessions/{id}` | Detalle + historial |
| `POST` | `/api/v1/work-simulator/sessions/{id}/messages` | Mensaje conversacional |
| `POST` | `/api/v1/work-simulator/sessions/{id}/challenges` | Generar reto laboral |
| `POST` | `/api/v1/work-simulator/sessions/{id}/evaluate` | Evaluar respuesta al reto |

Todas las rutas requieren `Authorization: Bearer <supabase_jwt>`.

## Migración

Aplicar `frontend/supabase/migrations/008_work_simulator_sessions.sql` en Supabase.

## Decisiones

- **Clave API solo en backend**: el frontend usa `api-client.ts` hacia FastAPI.
- **Gemini Pro para simulador**: mayor coherencia narrativa en escenarios largos.
- **Fallbacks**: si el JSON de Gemini falla, retos/evaluaciones por defecto evitan romper la UX.
- **OpenAI eliminado**: copilot y video migrados a Gemini para un solo proveedor de IA.
