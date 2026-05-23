# JobFlow

La plataforma inteligente que evalúa candidatos como lo haría un reclutador senior, pero sin sesgo, 10x más rápido y a 1/10 del costo.

JobFlow es una plataforma de evaluación inteligente de talento. Las empresas publican empleos y califican candidatos en 10 minutos con IA multimodal (video + análisis facial + simulaciones reales + Copilot coaching). Los jóvenes practican infinito con Copilot, se simulan en un día laboral real, y reciben feedback automático.

Visión a largo plazo: convertirse en la capa base de infraestructura de evaluación de talento tal que agentes de IA puedan entrevistar, evaluar y hacer ofertas de empleo de forma autónoma.

---

## Estado del Proyecto

Este repositorio contiene el **MVP Full-Stack v1.0** — Frontend completamente navegable con simulaciones, análisis de video y Copilot coaching; Backend con Gemini, MediaPipe y scoring automático.

| Fase | Estado |
|------|--------|
| **MVP Frontend** | 🚧 En desarrollo |
| **MVP Backend** | 🚧 En desarrollo |
| **Simulación Video** | 🚧 En desarrollo |
| **Simulación Día Laboral** | 🚧 En desarrollo |
| **Copilot (Jóvenes)** | 🚧 En desarrollo |
| **Agentes por Rol (Gemini)** | 🚧 En desarrollo |
| **Copilot (Empresas)** | ⏳ Pendiente |
| **Notificaciones (FCM + SendGrid)** | ⏳ Pendiente |
| **Pagos (Stripe)** | ⏳ Pendiente |
| **Admin Dashboard** | ⏳ Pendiente |

---

## Stack

| Categoría | Tecnología |
|-----------|------------|
| **Framework Frontend** | Next.js 15 (App Router + Turbopack) |
| **Lenguaje Frontend** | TypeScript |
| **Estilos** | Tailwind CSS |
| **Componentes** | shadcn/ui |
| **Estado** | Zustand |
| **Formularios** | React Hook Form + Zod |
| **Video** | RecordRTC + Simple-peer (WebRTC) |
| **Gráficos** | Recharts |
| **Animaciones** | Framer Motion |
| **Íconos** | lucide-react |
| **Framework Backend** | FastAPI |
| **Lenguaje Backend** | Python 3.11 |
| **Base de Datos** | PostgreSQL (Supabase) — Fase 2 |
| **Auth** | Supabase Auth — Fase 2 |
| **Real-time** | Supabase Realtime — Fase 2 |
| **IA Generativa** | Google Gemini API |
| **Visión** | MediaPipe + OpenCV |
| **Audio** | Librosa + Pydub |
| **Pagos** | Stripe — Fase 2 |
| **Deploy Frontend** | Vercel |
| **Deploy Backend** | Render |

---

## Flujos Principales

### Para Jóvenes (Candidatos)

1. Registrarse: Email + Google OAuth
2. Completar perfil: Skills, experiencia, ubicación
3. Buscar empleos: Feed dinámico con filtros
4. **[Opcional] Copilot Joven:** Practicar antes de simulación real
   - Preguntas dinámicas por rol
   - Feedback inmediato + coaching
   - Sugerencias automáticas
5. Aplicar a empleo: Inicia simulaciones
6. **Simulación Video (5-10 min):** Graba respuestas, MediaPipe analiza
7. **Simulación Día Laboral (8 horas):** 5 actividades reales en horarios reales
8. Ver resultados: Score 0-100, feedback, badges
9. Premium: Simulaciones sin límite + Copilot ilimitado

### Para Empresas (Reclutadores)

1. Registrarse: Email + verificación dominio
2. Crear empresa: Nombre, logo, sector
3. Publicar empleos: Título, descripción, 5 actividades del día
4. **[Opcional] Copilot Recruiter:** Análisis automático de candidatos
   - Ranking inteligente
   - Recomendaciones de entrevista
   - Red flags automáticas
   - Insights y predicciones
5. Ver candidatos: Lista con scores, videos, filtros
6. Hacer ofertas: Directa en plataforma
7. Premium: Empleos ilimitados + Copilot avanzado + analytics

---

## Instalación

### Frontend

```bash
# Clonar repositorio
git clone https://github.com/tu-org/jobflow.git
cd jobflow/frontend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.local.example .env.local

# Iniciar en desarrollo
npm run dev
```

La app estará disponible en **http://localhost:3000**.

### Backend

```bash
# Navegar a backend
cd ../backend

# Crear virtual environment
python -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Copiar variables de entorno
cp .env.example .env.local

# Correr migraciones
alembic upgrade head

# Iniciar servidor
python -m uvicorn app.main:app --reload
```

El servidor estará disponible en **http://localhost:8000**.

---

## Scripts

### Frontend
```bash
npm run dev          # Servidor desarrollo con Turbopack
npm run build        # Build producción
npm run start        # Servidor producción
npm run lint         # ESLint
npm run typecheck    # TypeScript
```

### Backend
```bash
make install         # Instalar dependencias
make dev             # Servidor desarrollo
make test            # Tests
make lint            # Linting
make format          # Formatear código
```

---

## Estructura del Proyecto
