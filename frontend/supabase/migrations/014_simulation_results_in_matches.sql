-- 014_simulation_results_in_matches.sql
-- Agrega resultados de simulación laboral a job_matches para que las empresas
-- puedan ver el desempeño real del candidato en el simulador.

ALTER TABLE public.job_matches
  ADD COLUMN IF NOT EXISTS simulation_score        INT     CHECK (simulation_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS simulation_passed       BOOLEAN,
  ADD COLUMN IF NOT EXISTS simulation_quality      TEXT    CHECK (simulation_quality IN ('insuficiente','aceptable','bueno','excelente')),
  ADD COLUMN IF NOT EXISTS simulation_feedback     TEXT,
  ADD COLUMN IF NOT EXISTS simulation_strengths    JSONB,
  ADD COLUMN IF NOT EXISTS simulation_improvements JSONB,
  ADD COLUMN IF NOT EXISTS simulation_completed_at TIMESTAMPTZ;

-- Índice para que las empresas puedan filtrar candidatos que simularon
CREATE INDEX IF NOT EXISTS job_matches_simulation_idx
  ON public.job_matches (job_id, simulation_score)
  WHERE simulation_score IS NOT NULL;
