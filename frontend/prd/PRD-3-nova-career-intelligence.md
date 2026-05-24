# PRD-3 — Nova: AI Career Intelligence System
**Clasificación:** Confidencial — Interno HYRE  
**Versión:** 1.0.0  
**Fecha:** 2026-05-24  
**Autor:** Product & Engineering Leadership  
**Estado:** Draft para revisión

---

## Tabla de Contenidos

1. [Visión de Producto](#1-visión-de-producto)
2. [Contexto Estratégico](#2-contexto-estratégico)
3. [Usuarios y Personas](#3-usuarios-y-personas)
4. [Historias de Usuario](#4-historias-de-usuario)
5. [Requerimientos Funcionales](#5-requerimientos-funcionales)
6. [Requerimientos No Funcionales](#6-requerimientos-no-funcionales)
7. [Arquitectura Técnica](#7-arquitectura-técnica)
8. [Diseño de IA y Pipelines](#8-diseño-de-ia-y-pipelines)
9. [Estructura de Base de Datos](#9-estructura-de-base-de-datos)
10. [APIs y Contratos](#10-apis-y-contratos)
11. [Sistema de Scoring](#11-sistema-de-scoring)
12. [Experiencia de Usuario](#12-experiencia-de-usuario)
13. [Seguridad y Privacidad](#13-seguridad-y-privacidad)
14. [Escalabilidad e Infraestructura](#14-escalabilidad-e-infraestructura)
15. [Métricas y KPIs](#15-métricas-y-kpis)
16. [Monetización](#16-monetización)
17. [Roadmap](#17-roadmap)
18. [Riesgos Técnicos](#18-riesgos-técnicos)
19. [Diferenciadores Competitivos](#19-diferenciadores-competitivos)
20. [Criterios de Evaluación](#20-criterios-de-evaluación)

---

## 1. Visión de Producto

### 1.1 Declaración de Visión

> **Nova** es el sistema de inteligencia de carrera más avanzado para la generación emergente de talento latinoamericano. No es un chatbot. Es un Career Intelligence System que actúa como recruiter senior, career coach, ATS scanner, LinkedIn optimizer y arquitecto de CV — todo en uno — impulsado por IA de última generación.

### 1.2 Misión

Democratizar el acceso a orientación profesional de nivel Fortune 500 para jóvenes sin experiencia, garantizando que ningún candidato sea rechazado por un CV mal estructurado cuando tiene el talento real para el rol.

### 1.3 Problema

El 75% de los CVs son rechazados por sistemas ATS antes de que un humano los lea. Los jóvenes en LATAM:

- No tienen acceso a career coaches (costo: $80-300/sesión)
- No saben cómo estructurar logros cuantificables
- Desconocen qué keywords buscan los ATS
- No pueden adaptar su CV para cada oferta
- Carecen de feedback real sobre por qué no los llaman

### 1.4 Solución

Nova analiza, reescribe, optimiza y genera CVs usando modelos de IA multimodal, con feedback accionable en tiempo real, simulación de evaluación de recruiter, y generación de roadmap profesional personalizado.

### 1.5 Propuesta de Valor

| Para candidatos | Para empresas |
|---|---|
| CV optimizado para ATS en minutos | Pool de candidatos pre-filtrados con scores confiables |
| Feedback como si tuvieras un career coach | Reducción de tiempo de screening en 60% |
| Versiones del CV por rol específico | Acceso a señales de talento más allá del CV |
| Roadmap de carrera con IA | Nova como pre-entrevistador inteligente |

---

## 2. Contexto Estratégico

### 2.1 Mercado

- **TAM:** $32B — HR Tech global
- **SAM:** $4.2B — plataformas de talento LATAM
- **SOM:** $180M — jóvenes profesionales Colombia, México, Argentina

### 2.2 Competidores

| Competidor | Debilidad que Nova resuelve |
|---|---|
| Rezi.ai | Solo reescritura, sin análisis profundo |
| Jobscan | Solo ATS matching, no genera ni reescribe |
| Resume.io | Templates visuales, sin inteligencia real |
| LinkedIn Premium | Caro, no genera ni analiza CVs |
| ChatGPT directo | Sin contexto HRTech, sin templates ATS |

### 2.3 Ventaja Competitiva Sostenible

1. **Contexto LATAM nativo** — modelos con mercado laboral colombiano/latinoamericano
2. **Datos propios** — simulaciones HYRE generan señales de talento únicas
3. **Loop cerrado** — Nova ve resultados: candidatos que mejoran CVs y consiguen entrevistas
4. **Multimodal** — analiza PDF, imagen, video de presentación y portafolio en conjunto

---

## 3. Usuarios y Personas

### Persona 1 — Valentina, 22 años (Candidata sin experiencia)
Recién graduada de ingeniería. Tiene proyectos en GitHub pero no sabe cómo presentarlos.  
**Necesidad:** Nova construye su CV desde cero y le dice qué hacer primero.

### Persona 2 — Sebastián, 26 años (Candidato estancado)
3 años de experiencia. Ha enviado 50 CVs sin respuesta.  
**Necesidad:** Entender por qué lo rechazan y recibir versiones del CV por industria.

### Persona 3 — Camila, Recruiter en startup tech
Recibe 200 CVs por posición.  
**Necesidad:** Nova pre-evalúa candidatos y entrega ranking con justificación.

### Persona 4 — Andrés, 19 años (Estudiante)
Solo proyectos académicos y voluntariado.  
**Necesidad:** Nova construye un CV desde cero y genera roadmap de qué aprender.

---

## 4. Historias de Usuario

### Épica 1 — Análisis de CV
```
US-001: Como candidato, quiero subir mi CV en PDF y recibir un análisis 
        completo en menos de 30 segundos.

US-002: Como candidato, quiero ver un score desglosado (ATS, recruiter, 
        técnico, visual) para saber en qué área mejorar primero.

US-003: Como candidato, quiero que Nova detecte gaps laborales y me explique 
        cómo comunicarlos positivamente.

US-004: Como candidato, quiero que Nova detecte keywords faltantes para una 
        oferta específica.

US-005: Como candidato sin experiencia, quiero que Nova evalúe mis proyectos 
        académicos y los convierta en experiencia relevante.
```

### Épica 2 — Reescritura y Generación
```
US-006: Como candidato, quiero que Nova reescriba mis bullets para que 
        suenen más impactantes y cuantificables.

US-007: Como candidato, quiero generar un CV desde cero respondiendo 
        preguntas conversacionales con Nova.

US-008: Como candidato, quiero descargar mi CV optimizado en PDF y DOCX 
        con diferentes templates.

US-009: Como candidato, quiero que Nova genere versiones de mi CV 
        adaptadas a cada oferta de trabajo.

US-010: Como candidato, quiero que Nova genere mi carta de presentación 
        automáticamente.
```

### Épica 3 — Career Intelligence
```
US-011: Como candidato, quiero un roadmap profesional con habilidades, 
        cursos y certificaciones según mi perfil.

US-012: Como candidato, quiero que Nova simule cómo un recruiter evaluaría 
        mi CV en los primeros 6 segundos.

US-013: Como candidato, quiero ver cuántos roles soy elegible hoy y qué 
        me falta para los siguientes.

US-014: Como empresa, quiero que Nova pre-evalúe candidatos y entregue 
        un ranking con justificación.
```

---

## 5. Requerimientos Funcionales

### RF-01: Upload Inteligente de Archivos

**Formatos soportados:** PDF, DOCX/DOC, TXT/RTF, PNG/JPG/WEBP, ZIP (portafolio)

**Pipeline de ingesta:**
1. Validación de formato MIME real (no confiar en extensión) y tamaño (< 10MB)
2. Virus scan (ClamAV)
3. Extracción de texto:
   - PDFs nativos → pdfplumber / PyMuPDF
   - PDFs escaneados / imágenes → Google Vision API (OCR) con fallback Tesseract
   - DOCX → python-docx
4. Detección automática de secciones (contacto, resumen, experiencia, educación, skills, proyectos, idiomas, certificaciones)
5. Preprocesamiento NLP: normalización de fechas, detección de entidades (empresas, roles, tecnologías)
6. Almacenamiento en Supabase Storage + registro en DB
7. Trigger de análisis asíncrono vía Redis queue

**Edge cases:**
- CV en imagen girada → auto-rotate antes de OCR
- CV con columnas múltiples → layout detection con LayoutParser
- CV en idiomas mixtos → detección y procesamiento bilingüe
- PDF bomb → ratio comprimido/descomprimido check

---

### RF-02: Motor de Análisis de CV

Nova genera análisis multidimensional:

**Módulos de análisis:**
- **Estructural:** presencia de secciones, longitud óptima, legibilidad
- **Contenido:** cuantificación de logros, verbos de acción, keywords técnicas, coherencia temporal
- **ATS:** parsabilidad por Greenhouse/Lever/Workday/Taleo, elementos que rompen ATS (tablas, columnas, imágenes)
- **Habilidades blandas:** señales de liderazgo, comunicación, trabajo en equipo
- **Seniority detection:** cruza años de experiencia con complejidad de responsabilidades

**Output estructurado:**
```json
{
  "cv_id": "uuid",
  "scores": {
    "general": 74, "ats": 61, "technical": 82,
    "recruiter_impression": 68, "visual": 55, "communication": 79
  },
  "sections_detected": ["contact", "summary", "experience", "education", "skills"],
  "sections_missing": ["projects", "certifications"],
  "strengths": [{ "category": "keywords", "description": "...", "evidence": "..." }],
  "weaknesses": [{ "category": "ats", "description": "...", "impact": "critical" }],
  "ats_issues": [{ "issue": "table_detected", "fix": "Reemplazar tabla por bullets" }],
  "keyword_gaps": [{ "keyword": "Docker", "importance": "critical" }],
  "bullets_weak": [{ "original": "...", "suggestion": "..." }],
  "top_3_actions": [{ "priority": 1, "action": "...", "time_estimate": "5 min" }]
}
```

---

### RF-03: Sistema de Feedback Inteligente

**Nivel 1 — Quick Wins (< 5 min):**
- Problemas de formato inmediatos
- Campos faltantes críticos (email, teléfono)
- Bullets sin cuantificación

**Nivel 2 — Mejoras Estratégicas (1-3 días):**
- Reescritura de sección de experiencia
- Agregar proyectos con impacto medible

**Nivel 3 — Transformación (1 semana):**
- Cambio de formato completo para ATS
- Construcción de narrativa profesional coherente

**Principios del tono:**
- Primera persona, directo y empático
- Sin jerga de RR.HH.
- Siempre cita texto específico del CV
- Con benchmarks cuantificados ("El 80% de candidatos exitosos en este rol tiene X")

---

### RF-04: Reescritura Automática de CV

**Pipeline por bullet:**
1. Extrae componentes: acción, contexto, resultado
2. Clasifica impacto: bajo/medio/alto
3. Reescribe con framework STAR (Situación, Tarea, Acción, Resultado)
4. Inyecta keywords del mercado por industria
5. Ajusta tono según seniority
6. Verifica coherencia con el resto del CV

```
ANTES: "Participé en proyectos de desarrollo web"
DESPUÉS: "Desarrollé 3 aplicaciones web con React y Node.js para 2 clientes 
         enterprise, reduciendo tiempo de carga en 40% mediante optimización de APIs"
```

**Soporte:** español (CO, MX, AR, ES) e inglés (US, UK)  
**Multi-industria:** tech, fintech, marketing, salud, retail, consultoría  
**Multi-seniority:** sin experiencia, junior (0-2), mid (2-5), senior (5+), executive (10+)

---

### RF-05: Generación Completa de CV desde Cero

**Flujo conversacional (8-15 preguntas adaptativas):**
```
Nova: "¿Cuál es tu nombre completo?"
Nova: "¿En qué área quieres trabajar?"
Nova: "¿Tienes experiencia laboral, aunque sea informal o freelance?"
  → [NO] "Cuéntame sobre tus proyectos académicos más importantes"
  → [SÍ] "Cuéntame tu experiencia más reciente"
...
Nova: "Aquí está tu CV. ¿Qué template prefieres?"
```

**Templates:**
- `ats-clean`: máxima compatibilidad ATS, diseño minimalista
- `modern-tech`: para roles tech, dark header opcional
- `executive`: para liderazgo y management
- `creative`: para diseño, marketing, UX
- `academic`: para recién egresados

**Output:** PDF (WeasyPrint/Puppeteer) + DOCX (python-docx)

---

### RF-06: Matching Inteligente con Empleos

El usuario pega o importa una job description. Nova:

1. Extrae entidades de la JD: skills requeridos/deseados, seniority, industria
2. Compara contra perfil del candidato (CV + datos HYRE)
3. Genera:
   - Match score global (0-100%) + desglose por dimensión
   - Gap analysis: skills faltantes con prioridad
   - CV adaptado con keywords de la JD inyectadas
   - Probabilidad de pasar ATS
   - Checklist de preparación para entrevista

---

### RF-07: Career Intelligence

**Skill Recommendations:** Top 5 skills con mayor ROI en el mercado, con cursos gratuitos (YouTube, freeCodeCamp) y pagos (Udemy, Platzi), tiempo estimado e impacto en salario.

**Roadmap Profesional:**
```
Estado actual: Junior Frontend Developer
Objetivo: Senior Full-Stack

Mes 1-3:   Docker + CI/CD básico
Mes 4-6:   AWS Fundamentals (SAA-C03)  → +$800/mes estimado
Mes 7-12:  System Design + PostgreSQL avanzado
Mes 13-18: Liderazgo técnico + mentoring → +$2,200/mes estimado

Roles ahora: Backend Dev (82%), DevOps Jr (71%)
Roles +6m:  Cloud Engineer (74%), SRE Jr (68%)
```

**Recruiter Simulator:**
```
En 6 segundos, un recruiter de TechCorp vería:
✅ "Sebastián García — Desarrollador Full Stack"
✅ "3 años en Rappi"
✅ "React, Node.js, PostgreSQL"
❌ No ve resumen que explique tu valor único
❌ Email gmail123@ genera duda de seniority

Probabilidad de pasar a siguiente ronda: 34%
Con mejoras de Nova: 71%
```

---

### RF-08: Carta de Presentación Automática

- Personalizada por empresa y rol
- Tono ajustable (formal, conversacional, creativo)
- Longitud: 250-400 palabras
- Estructura: gancho → valor → evidencia → CTA
- Versiones: email body, carta formal PDF, mensaje LinkedIn

---

### RF-09: Análisis de Portafolio y GitHub

**GitHub:** extrae lenguajes, commits en últimos 12 meses, calidad de READMEs, stars, contribuciones a repos externos.  
**Proyectos web:** screenshot + análisis visual de la URL.  
**PDFs académicos:** extrae logros, tecnologías, impacto.

Output específico: "Tu GitHub muestra 847 commits en el último año — señal fuerte. Pero 3 proyectos no tienen demo link — el 70% de recruiters no lee código sin demo."

---

## 6. Requerimientos No Funcionales

| Categoría | Requerimiento | Meta |
|---|---|---|
| **Performance** | Análisis de CV completo | < 30s P95 |
| **Performance** | Streaming del feedback | Primera respuesta < 3s |
| **Performance** | Generación de PDF | < 8s |
| **Disponibilidad** | Uptime | 99.5% SLA |
| **Disponibilidad** | Análisis IA | Degradación elegante con modelo backup |
| **Escalabilidad** | MVP | 10,000 análisis/día |
| **Escalabilidad** | Escala | 500,000 análisis/día (arquitectura lista) |
| **Precisión IA** | ATS score accuracy | > 85% vs. ground truth humano |
| **Precisión IA** | Section detection | > 95% accuracy |
| **Precisión IA** | Reescritura aceptada | > 70% thumbs up |
| **Seguridad** | Encriptación at rest | AES-256 |
| **Seguridad** | Encriptación in transit | TLS 1.3 |
| **Privacidad** | Right to be forgotten | Implementado (< 72h) |
| **Compliance** | Ley 1581 Colombia | Habeas Data compliant |

---

## 7. Arquitectura Técnica

### 7.1 Vista General

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 15)                   │
│  Nova Chat Panel │ CV Upload │ Dashboard │ CV Builder       │
└─────────────────────────────────────────────────────────────┘
                              │
                    API Gateway (Next.js API Routes)
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   FastAPI Backend      Queue Workers          Supabase
   (Python 3.12)     (Redis + RQ/Bull)     (Auth + DB + Storage)
        │                     │
   ┌────┴────┐         ┌──────┴──────┐
   │ AI      │         │ File        │
   │ Service │         │ Processor   │
   │ (Gemini)│         │ (OCR+Parse) │
   └─────────┘         └─────────────┘
        │
   pgvector (embeddings en Supabase)
```

### 7.2 Estructura Frontend

```
frontend/
├── app/nova/
│   ├── page.tsx                     # Dashboard principal Nova
│   ├── upload/page.tsx              # Upload de CV
│   ├── analysis/[id]/page.tsx       # Resultado de análisis
│   ├── builder/page.tsx             # CV Builder conversacional
│   └── match/page.tsx               # Job matching
├── components/nova/
│   ├── nova-cv-upload.tsx           # Upload con drag & drop
│   ├── nova-score-card.tsx          # Scorecard visual
│   ├── nova-diff-viewer.tsx         # CV original vs optimizado
│   ├── nova-roadmap.tsx             # Timeline de roadmap
│   ├── nova-recruiter-sim.tsx       # Simulador recruiter
│   └── nova-match-report.tsx        # Job match report
└── modules/nova/
    ├── types.ts                     # Tipos Nova completos
    ├── hooks.ts                     # useNovaCv, useNovaAnalysis
    ├── api.ts                       # Cliente API Nova
    └── cv-service.ts                # Gestión de CVs
```

### 7.3 Estructura Backend

```
backend/app/
├── api/v1/routes/
│   ├── nova_cv.py          # Upload, análisis, historial
│   ├── nova_generate.py    # Generación y reescritura
│   ├── nova_match.py       # Job matching
│   └── nova_career.py      # Roadmap, skills, career intel
├── domain/services/
│   ├── cv_parser.py        # Parsing multi-formato
│   ├── cv_analyzer.py      # Motor de análisis
│   ├── cv_rewriter.py      # Reescritura con IA
│   ├── cv_generator.py     # Generación desde cero
│   └── job_matcher.py      # Matching CV vs JD
├── infrastructure/
│   ├── ocr/
│   │   ├── google_vision.py
│   │   └── tesseract_adapter.py
│   ├── parsers/
│   │   ├── pdf_parser.py
│   │   └── docx_parser.py
│   ├── queue/
│   │   ├── redis_client.py
│   │   └── cv_analysis_worker.py
│   └── pdf_generator/
│       ├── weasyprint_adapter.py
│       └── templates/
└── workers/
    └── nova_worker.py
```

### 7.4 Flujo de Datos — Análisis Asíncrono

```
Usuario sube CV
      │
POST /api/v1/nova/cv/upload
      │ → Response inmediata: { cv_id, status: "processing" }
      ▼
Supabase Storage → cv_uploads/{user_id}/{cv_id}
      │
Redis Queue → job: analyze_cv(cv_id)
      │
Worker:
  ├── parse_file()          → texto crudo (PDF nativo o OCR)
  ├── detect_sections()     → NLP + regex híbrido
  ├── extract_entities()    → Gemini Pro structured output
  ├── score_cv()            → 6 scores con justificación
  ├── detect_ats_issues()   → reglas + ML
  ├── generate_feedback()   → Gemini Pro con contexto
  ├── embed_cv()            → text-embedding-004 → pgvector
  └── save_analysis()       → Supabase DB
        │
Supabase Realtime → frontend notificado
        │
Usuario ve resultados
```

---

## 8. Diseño de IA y Pipelines

### 8.1 Modelos y Responsabilidades

| Tarea | Modelo Primario | Backup | Razón |
|---|---|---|---|
| Extracción de entidades | Gemini 1.5 Pro | GPT-4o-mini | Contexto largo, structured output |
| Feedback conversacional | Gemini 1.5 Flash | Claude Haiku | Velocidad + costo |
| Reescritura de bullets | Gemini 1.5 Pro | GPT-4o | Calidad de escritura |
| Generación de CV | Gemini 2.0 Pro | Claude Sonnet | Instrucciones complejas |
| OCR | Google Vision API | Tesseract | Precisión en documentos |
| Embeddings | text-embedding-004 | OpenAI ada-002 | Compatibilidad pgvector |
| Matching semántico | pgvector cosine similarity | — | Búsqueda vectorial nativa |

### 8.2 Prompts Clave

```python
SYSTEM_PROMPT_CV_ANALYZER = """
Eres Nova, el AI Career Intelligence System de HYRE.
Actúas como una combinación de:
- Recruiter Senior con 15 años de experiencia en tech LATAM
- Especialista ATS certificado en Greenhouse y Lever
- Career Coach que ha ayudado a +10,000 candidatos

Al analizar un CV debes:
1. Identificar fortalezas reales y específicas (no genéricas)
2. Detectar problemas que causan rechazo automático en ATS
3. Encontrar bullets débiles sin cuantificación
4. Detectar inconsistencias de fechas o seniority
5. Evaluar la narrativa profesional general

Tu feedback debe ser:
- Directo pero empático
- Específico con ejemplos del CV del usuario
- Accionable con pasos concretos
- En español colombiano natural

NUNCA uses "¡Gran CV!" o feedback genérico.
SIEMPRE cita el texto específico del CV cuando das feedback.
"""

REWRITE_PROMPT = """
Reescribe el siguiente bullet usando el framework STAR.
Mantén información veraz — NUNCA inventes métricas.
Si no hay métrica real, usa lenguaje de impacto cualitativo.
Máximo 2 líneas. Empieza con verbo de acción fuerte.

Bullet original: {bullet}
Industria: {industry}
Rol objetivo: {target_role}
Seniority: {seniority}
Keywords del mercado (top 10): {keywords}
"""
```

### 8.3 RAG System

**Fuentes vectorizadas en pgvector:**
- 50,000+ job descriptions de Colombia, México, Argentina
- Benchmark de CVs exitosos por industria y seniority
- Guías ATS por sistema (Greenhouse, Lever, Workday, Taleo)
- Keywords por tecnología y rol (actualización semanal)

```sql
CREATE TABLE cv_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID REFERENCES nova_cvs(id),
  chunk_type TEXT,           -- 'full', 'experience', 'skills'
  chunk_text TEXT,
  embedding vector(768),     -- text-embedding-004
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX cv_embeddings_idx ON cv_embeddings
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### 8.4 Estimación de Costos IA

| Operación | Modelo | Costo/análisis | 50K/mes | Costo/mes |
|---|---|---|---|---|
| Extracción entidades | Gemini 1.5 Pro | $0.006 | 50,000 | $300 |
| Feedback | Gemini 1.5 Flash | $0.0004 | 50,000 | $20 |
| Reescritura | Gemini 1.5 Pro | $0.009 | 20,000 | $180 |
| OCR | Google Vision | $0.0015 | 15,000 | $22 |
| Embeddings | text-embedding-004 | $0.00002 | 50,000 | $1 |
| **TOTAL** | | | | **~$523/mes** |

---

## 9. Estructura de Base de Datos

```sql
-- CVs subidos
CREATE TABLE nova_cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,            -- pdf, docx, image
  raw_text TEXT,
  parsed_data JSONB,         -- secciones parseadas estructuradas
  status TEXT DEFAULT 'pending', -- pending|processing|ready|error
  is_primary BOOLEAN DEFAULT FALSE,
  industry TEXT,
  target_role TEXT,
  seniority TEXT,
  language TEXT DEFAULT 'es',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Análisis
CREATE TABLE nova_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID REFERENCES nova_cvs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  score_general INT, score_ats INT, score_technical INT,
  score_recruiter INT, score_visual INT, score_communication INT,
  strengths JSONB, weaknesses JSONB, ats_issues JSONB,
  keyword_gaps JSONB, bullets_analysis JSONB,
  sections_detected TEXT[], sections_missing TEXT[],
  top_actions JSONB,
  feedback_summary TEXT,
  feedback_detailed JSONB,
  model_used TEXT,
  processing_time_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Versiones generadas/reescritas
CREATE TABLE nova_cv_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID REFERENCES nova_cvs(id),
  user_id UUID REFERENCES profiles(id),
  version_type TEXT,         -- 'rewritten'|'generated'|'job_adapted'
  template TEXT,
  target_job_id UUID,
  content JSONB,
  pdf_url TEXT,
  docx_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job targets para matching
CREATE TABLE nova_job_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  title TEXT, company TEXT, description TEXT, url TEXT,
  required_skills JSONB, desired_skills JSONB,
  seniority TEXT, industry TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resultados de matching
CREATE TABLE nova_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID REFERENCES nova_cvs(id),
  job_id UUID REFERENCES nova_job_targets(id),
  user_id UUID REFERENCES profiles(id),
  match_score INT, match_technical INT, match_experience INT,
  match_education INT, match_soft_skills INT,
  missing_skills JSONB, ats_pass_probability INT,
  adapted_cv_id UUID REFERENCES nova_cv_versions(id),
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roadmap profesional
CREATE TABLE nova_roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  current_role TEXT, target_role TEXT, timeline_months INT,
  milestones JSONB,
  recommended_skills JSONB, recommended_courses JSONB,
  compatible_roles_now JSONB, compatible_roles_future JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE nova_cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nova_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE nova_cv_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own CVs" ON nova_cvs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own analyses" ON nova_analyses FOR ALL USING (auth.uid() = user_id);
```

---

## 10. APIs y Contratos

### 10.1 Endpoints

```
POST   /api/v1/nova/cv/upload              # Subir CV
GET    /api/v1/nova/cv                     # Listar CVs del usuario
GET    /api/v1/nova/cv/{id}                # Detalle de CV
DELETE /api/v1/nova/cv/{id}                # Eliminar CV
PATCH  /api/v1/nova/cv/{id}/primary        # Marcar como CV principal

POST   /api/v1/nova/cv/{id}/analyze        # Disparar análisis
GET    /api/v1/nova/cv/{id}/analysis       # Resultado de análisis
POST   /api/v1/nova/cv/{id}/rewrite        # Reescribir CV completo
POST   /api/v1/nova/cv/{id}/rewrite/bullet # Reescribir bullet específico
POST   /api/v1/nova/cv/generate            # Generar CV desde cero
POST   /api/v1/nova/cv/{id}/export         # Exportar PDF/DOCX

POST   /api/v1/nova/match                  # Matching CV vs Job Description
GET    /api/v1/nova/match/{id}             # Resultado de matching

GET    /api/v1/nova/roadmap                # Roadmap profesional
POST   /api/v1/nova/roadmap/generate       # Generar/regenerar roadmap
GET    /api/v1/nova/career/roles           # Roles compatibles
GET    /api/v1/nova/career/skills          # Skills recomendadas
POST   /api/v1/nova/career/simulate-recruiter
```

### 10.2 Contrato — Upload

```typescript
// POST /api/v1/nova/cv/upload
// Request: multipart/form-data
{ file: File, name?: string, target_role?: string, industry?: string }

// Response 202
{
  cv_id: string,
  status: "processing",
  estimated_time_seconds: 25,
  realtime_channel: "nova:cv:{cv_id}"  // Supabase Realtime
}

// Evento Realtime al terminar
{
  event: "nova:analysis:complete",
  cv_id: string,
  scores: { general, ats, technical, recruiter, visual, communication },
  top_actions: string[],
  analysis_id: string
}
```

---

## 11. Sistema de Scoring

### 11.1 Fórmula de Scores

**Score General = ATS×0.25 + Technical×0.25 + Recruiter×0.30 + Visual×0.10 + Communication×0.10**

**ATS Score (base 100):**
```
- Tabla detectada:              -25
- Columnas múltiples:           -20
- Header/footer con texto:      -15
- Imágenes embebidas:           -10
- Sin sección de skills:        -10
- Email no parseable:           -10
+ Keywords relevantes:          +3 por keyword (max +20)
+ Estructura estándar:          +5
```

**Recruiter Score (base 60):**
```
+ Resumen ejecutivo < 4 líneas: +10
+ Título profesional claro:     +5
+ Logro cuantificado en bullet 1: +10
+ LinkedIn URL:                 +5
+ GitHub/Portfolio (tech):      +5
- Sin fechas en experiencia:    -15
- Gaps > 1 año sin explicar:    -10
- Email no profesional:         -10
```

**Technical Score (base 50):**
```
+ Skills en demanda detectadas: +3 por skill (max +30)
+ Proyectos con tech moderna:   +10
+ Certificaciones relevantes:   +5 por cert (max +15)
+ GitHub activo:                +5
- Skills obsoletas sin contexto: -5
```

### 11.2 Benchmark por Seniority

| Score | Sin exp | Junior | Mid | Senior |
|---|---|---|---|---|
| < 40 | Crítico | Crítico | Crítico | Crítico |
| 40-60 | Normal | Bajo | Crítico | Crítico |
| 60-75 | Bueno | Normal | Bajo | Bajo |
| 75-85 | Excelente | Bueno | Normal | Bajo |
| > 85 | Top 5% | Top 10% | Top 15% | Competitivo |

---

## 12. Experiencia de Usuario

### 12.1 Dashboard Principal

```
┌────────────────────────────────────────────────────────┐
│  Nova — Tu Career Intelligence                         │
│                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Score CV    │  │  ATS Score   │  │  Recruiter   │ │
│  │   74 / 100  │  │   61 / 100  │  │   68 / 100  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                        │
│  🔴 3 problemas críticos   🟡 5 mejoras sugeridas      │
│                                                        │
│  TOP ACCIONES                                          │
│  1. Eliminar tabla del encabezado ........... 5 min → │
│  2. Agregar resumen ejecutivo .............. 15 min → │
│  3. Cuantificar 4 bullets de experiencia ... 20 min → │
│                                                        │
│  [Reescribir CV con Nova]  [Ver análisis completo]    │
└────────────────────────────────────────────────────────┘
```

### 12.2 Diff Viewer

```
┌─────────────────────────────┬──────────────────────────────────┐
│ ORIGINAL                    │ OPTIMIZADO POR NOVA               │
├─────────────────────────────┼──────────────────────────────────┤
│ • Trabajé en el backend     │ ✓ Desarrollé APIs RESTful con     │
│   del sistema               │   FastAPI sirviendo 50K req/día   │
│                             │   con 99.9% uptime                │
├─────────────────────────────┼──────────────────────────────────┤
│ • Ayudé con la base         │ ✓ Optimicé queries PostgreSQL     │
│   de datos                  │   reduciendo latencia en 60%      │
└─────────────────────────────┴──────────────────────────────────┘
              [✓ Aceptar todos]  [Revisar uno a uno]
```

### 12.3 Recruiter Simulator

```
👁  SIMULACIÓN: Recruiter de TechCorp Colombia
                                          
En los primeros 6 segundos ve:

✅ "Sebastián García — Desarrollador Full Stack"
✅ "3 años en Rappi"
✅ "React, Node.js, PostgreSQL"
❌ No ve resumen que explique tu valor único
❌ Email gmail123@ genera duda de seniority

Probabilidad de pasar a siguiente ronda: 34%
████████░░░░░░░░░░░░ 34%

Con las mejoras de Nova: 71%
██████████████████░░ 71%
```

---

## 13. Seguridad y Privacidad

- **Encriptación:** AES-256 at rest, TLS 1.3 in transit
- **PII tokenizada** antes de enviar a APIs externas (Gemini, OpenAI)
- **No entrenamiento** con CVs sin consentimiento opt-in explícito
- **Retención:** soft delete → eliminación física a los 90 días
- **Right to be forgotten:** `DELETE /api/v1/nova/cv/delete-all` elimina CVs, análisis y embeddings en < 72h
- **Ley 1581/2012 Colombia:** consentimiento en registro, base legal documentada
- **Virus scan** en todo archivo entrante (ClamAV)
- **PDF bomb detection:** ratio comprimido/descomprimido check

---

## 14. Escalabilidad e Infraestructura

### Queue Strategy

```
Upload → Redis Queue
  ├── HIGH priority:   análisis mientras usuario espera
  ├── NORMAL priority: reescritura en background
  └── LOW priority:    embeddings, roadmap update

Worker Pool (horizontalmente escalable):
  ├── Worker A: parse + OCR
  ├── Worker B: AI analysis (Gemini)
  ├── Worker C: PDF generation
  └── Worker N: según carga (auto-scaling)
```

### Caching

| Dato | TTL | Tecnología |
|---|---|---|
| CV parseado | 24h | Redis |
| Keywords por industria | 7 días | Redis |
| Roadmap | 30 días | Redis |
| JDs vectorizadas | Persistente | pgvector |
| Benchmark scores | 1h | Redis |

---

## 15. Métricas y KPIs

| KPI | Meta MVP (3m) | Meta Escala (12m) |
|---|---|---|
| CVs analizados/día | 500 | 5,000 |
| Score mejora post-Nova | +15 pts | +25 pts |
| Tasa aceptación reescritura | > 65% | > 75% |
| CV generado → descargado | > 50% | > 65% |
| Tiempo análisis P95 | < 30s | < 20s |
| Uptime análisis IA | > 99% | > 99.5% |
| Costo por análisis | < $0.05 | < $0.02 |
| NPS feature Nova | > 40 | > 60 |

---

## 16. Monetización

### Planes

**Gratuito:**
- 2 análisis/mes
- Feedback básico (top 3 problemas)
- Score general (sin desglose)
- 1 descarga PDF (template básico)

**Nova Pro — $9.99/mes:**
- Análisis ilimitados con desglose completo
- Reescritura automática ilimitada
- Generación de CV desde cero
- 5 templates premium + descarga PDF/DOCX
- Job matching ilimitado
- Carta de presentación generada
- Roadmap profesional completo
- Recruiter simulator
- Análisis de portafolio/GitHub

**Nova Business — $49/mes por recruiter:**
- Pre-evaluación de candidatos
- Ranking automático por posición
- Análisis comparativo de pool
- Reportes exportables

**Add-ons:**
- Nova Review Humano: $19 (career coach real en 48h)
- Cover Letter Pack: $4.99 (5 cartas personalizadas)
- Análisis Urgente: $7.99 (cola prioritaria < 5 min)

---

## 17. Roadmap

### Fase 1 — MVP (Semanas 1-6)
- [ ] Upload PDF/DOCX con parser
- [ ] Análisis con Gemini (6 scores + feedback)
- [ ] Dashboard con scorecard
- [ ] Export PDF template ATS-clean
- [ ] Integración chat Nova existente

**Criterio:** 100 usuarios analizan CVs, NPS > 40

### Fase 2 — Core Features (Semanas 7-14)
- [ ] Diff viewer — reescritura bullet a bullet
- [ ] Reescritura de CV completo
- [ ] CV Builder conversacional
- [ ] 3 templates adicionales
- [ ] OCR para imágenes
- [ ] Job matching básico

**Criterio:** 500 CVs generados/semana, aceptación reescritura > 60%

### Fase 3 — Intelligence Layer (Semanas 15-22)
- [ ] Roadmap profesional con IA
- [ ] Recruiter simulator
- [ ] Roles compatibles dinámicos
- [ ] Análisis de portafolio GitHub
- [ ] RAG con base de datos de JDs
- [ ] Matching avanzado con CV adaptado

**Criterio:** 30% de usuarios prueban roadmap, conversión freemium > 6%

### Fase 4 — Scale & Monetization (Semanas 23-30)
- [ ] Nova Pro con pagos Stripe activados
- [ ] Nova Business MVP para recruiters
- [ ] Fine-tuning con datos HYRE propios
- [ ] Multi-idioma (inglés completo)
- [ ] API pública para partners

---

## 18. Riesgos Técnicos

| Riesgo | P | Impacto | Mitigación |
|---|---|---|---|
| Latencia análisis > 30s | Alta | Alto | Streaming parcial, progress bar, workers dedicados |
| OCR incorrecto en CVs complejos | Media | Alto | Fallback Gemini Vision, flag para revisión manual |
| Alucinaciones en reescritura (inventar métricas) | Media | Crítico | Validación factual pre-output, zero-hallucination check |
| Costo IA supera proyección | Media | Medio | Rate limiting por plan, caché agresivo, modelos baratos por tarea |
| PII de terceros en CVs | Baja | Crítico | PII detection + sanitización antes de APIs externas |
| Cambios breaking en Gemini API | Baja | Alto | Capa de abstracción, multi-proveedor, contract tests |
| Gaming: CVs inflados artificialmente | Media | Medio | Detección de inconsistencias, credibility score |

---

## 19. Diferenciadores Competitivos

1. **Contexto LATAM nativo** — Keywords, empresas y mercado laboral de Colombia/México/Argentina en el core, no adaptación de un producto US
2. **Loop cerrado de datos** — Nova mejora con cada candidato que consigue entrevistas a través de HYRE → datos únicos de qué funciona
3. **Multimodal real** — Analiza CV + video de presentación + GitHub + portafolio en conjunto, no por separado
4. **Integración con simulaciones** — Nova infiere habilidades blandas del desempeño en simulaciones HYRE, no solo del CV estático
5. **Sin experiencia = no problema** — Pipeline específico que convierte proyectos académicos en experiencia narrativa profesional
6. **Precio accesible LATAM** — $9.99/mes vs $30-50/mes de competidores en USD

---

## 20. Criterios de Evaluación

### 20.1 Criterios de Aceptación Funcionales

#### Upload y Parsing

| ID | Criterio | Verificación | Umbral |
|---|---|---|---|
| CE-001 | PDF de 1-10 páginas parseado correctamente | Test con 100 CVs reales | > 95% correcto |
| CE-002 | OCR accuracy en imágenes de CV | 50 CVs en imagen | Character accuracy > 97% |
| CE-003 | Secciones detectadas correctamente | 200 CVs con anotación manual | F1-score > 0.90 |
| CE-004 | Upload completo para archivos < 2MB | Load test 100 uploads | P95 < 5s |
| CE-005 | Archivo malicioso rechazado | 10 archivos infectados | 100% rechazo |
| CE-006 | CV con columnas múltiples manejado | 30 CVs con layout complejo | > 85% parse correcto |

#### Análisis de CV

| ID | Criterio | Verificación | Umbral |
|---|---|---|---|
| CE-010 | Score ATS correlaciona con evaluación humana | 50 CVs evaluados por 3 HR experts | Pearson r > 0.80 |
| CE-011 | Top 3 problemas coinciden con evaluación humana | A/B con 30 HR professionals | > 75% agreement |
| CE-012 | Tiempo análisis completo | 100 análisis en producción | P95 < 30s |
| CE-013 | Análisis no falla para CVs válidos | 500 CVs variados | 0% crash rate |
| CE-014 | Keyword gaps relevantes para el rol | Validación con 3 recruiters | > 80% keywords válidas |
| CE-015 | Detección de gaps laborales > 6 meses | 40 CVs con gaps conocidos | > 90% detección |

#### Reescritura

| ID | Criterio | Verificación | Umbral |
|---|---|---|---|
| CE-020 | Bullet reescrito aceptado por usuario | Métrica in-product thumbs up | > 65% aceptación |
| CE-021 | Reescritura NO inventa información | Revisión de 200 bullets | 0% información fabricada |
| CE-022 | Score ATS mejora tras reescritura | Análisis pre/post en 100 usuarios | Δ > 15 puntos |
| CE-023 | Mantiene idioma original | Test con CVs en español e inglés | 100% idioma correcto |
| CE-024 | Tiempo de reescritura de CV completo | 50 reescrituras en producción | P95 < 60s |

#### CV Builder (Generación desde cero)

| ID | Criterio | Verificación | Umbral |
|---|---|---|---|
| CE-030 | Candidato sin experiencia completa flujo | User testing con 10 candidatos | Median time < 15 min |
| CE-031 | CV generado pasa validación ATS | Análisis automático post-generación | ATS score > 75 |
| CE-032 | PDF renderiza correctamente | Test en Adobe, Chrome, Preview | 100% correcta |
| CE-033 | Flujo completa con < 15 preguntas | Análisis de sesiones | Median preguntas < 12 |

#### Job Matching

| ID | Criterio | Verificación | Umbral |
|---|---|---|---|
| CE-040 | Match score correlaciona con decisión recruiter | 50 pares CV+JD evaluados por recruiters | Pearson r > 0.75 |
| CE-041 | Missing skills son relevantes y específicas | Evaluación por 3 recruiters | > 80% skills válidas |
| CE-042 | CV adaptado mejora match score | Comparación automática pre/post | Δ > 10 puntos |

#### Career Intelligence

| ID | Criterio | Verificación | Umbral |
|---|---|---|---|
| CE-050 | Roadmap con pasos concretos (no genéricos) | Revisión por 5 career coaches | > 4.0/5.0 relevancia |
| CE-051 | Roles compatibles con porcentajes lógicos | Validación por 3 recruiters | > 80% plausibles |
| CE-052 | Recruiter simulator percibido como realista | Survey a 20 usuarios | > 70% "muy realista" |

---

### 20.2 Criterios de Performance Global

| Métrica | Mínimo | Objetivo |
|---|---|---|
| Uptime mensual | 99.0% | 99.5% |
| Análisis completados / intentados | > 97% | > 99% |
| Error rate endpoints Nova | < 2% | < 0.5% |
| Costo promedio por análisis | < $0.05 | < $0.02 |
| Queue job failure rate | < 2% | < 0.5% |
| NPS del feature | > 40 | > 60 |

---

### 20.3 Criterios de Salida del MVP

Nova está lista para escalar cuando cumple **TODOS**:

- [ ] 200 usuarios activos han analizado ≥ 1 CV
- [ ] Score promedio post-Nova > pre-Nova en +15 puntos (datos reales)
- [ ] Tasa de crash: 0% en test set de 500 CVs
- [ ] NPS > 45 con ≥ 50 respuestas
- [ ] ≥ 10 usuarios reportan haber conseguido entrevista tras usar Nova
- [ ] Costo IA < $0.05 por análisis en promedio
- [ ] Tiempo de análisis P95 < 30s en producción
- [ ] 0 incidentes de seguridad o leakage de CVs

---

### 20.4 Criterios de Calidad del Modelo IA

En benchmark interno de 500 CVs:

| Dimensión | Mínimo aceptable |
|---|---|
| Section detection F1-score | 0.90 |
| Entity extraction precision | 0.88 |
| ATS score correlation (vs human) | 0.80 |
| Feedback relevance (human eval 1-5) | ≥ 4.0 |
| Rewrite improvement ratio | ≥ 1.25× |
| Hallucination rate en reescritura | 0% |
| Keyword gap recall | > 0.85 |

---

*Documento vivo — actualizar con cada sprint.*  
*Próxima revisión: Completada Fase 1.*  
*Aprobaciones requeridas: Product Lead · Engineering Lead · Legal · Design Lead*
