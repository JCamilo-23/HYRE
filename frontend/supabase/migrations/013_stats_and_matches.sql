-- 013_stats_and_matches.sql

-- ─── 1. Enriquecer candidate_profiles ────────────────────────────────────────
ALTER TABLE public.candidate_profiles
  ADD COLUMN IF NOT EXISTS xp                   INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level                INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS nova_cv_score        INT,
  ADD COLUMN IF NOT EXISTS simulations_completed INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS profile_completeness  INT NOT NULL DEFAULT 0;

-- ─── 2. Tabla job_matches ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.job_matches (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id         UUID        REFERENCES public.jobs(id)     ON DELETE CASCADE NOT NULL,
  candidate_id   UUID        REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  match_score    INT         NOT NULL CHECK (match_score BETWEEN 0 AND 100),
  status         TEXT        NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'candidate_liked', 'company_liked', 'mutual', 'rejected')),
  candidate_note TEXT,
  company_note   TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (job_id, candidate_id)
);

ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Candidato ve sus matches"
    ON public.job_matches FOR SELECT
    USING (auth.uid() = candidate_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Candidato actualiza su match"
    ON public.job_matches FOR UPDATE
    USING (auth.uid() = candidate_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Empresa ve matches de sus vacantes"
    ON public.job_matches FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.jobs
        WHERE jobs.id = job_id AND jobs.company_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Empresa actualiza match de sus vacantes"
    ON public.job_matches FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.jobs
        WHERE jobs.id = job_id AND jobs.company_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS job_matches_candidate_idx ON public.job_matches (candidate_id);
CREATE INDEX IF NOT EXISTS job_matches_job_idx       ON public.job_matches (job_id);
CREATE INDEX IF NOT EXISTS job_matches_status_idx    ON public.job_matches (status);

-- ─── 3. Función: actualizar updated_at en job_matches ────────────────────────
CREATE OR REPLACE FUNCTION public.set_job_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS job_matches_updated_at ON public.job_matches;
CREATE TRIGGER job_matches_updated_at
  BEFORE UPDATE ON public.job_matches
  FOR EACH ROW EXECUTE FUNCTION public.set_job_matches_updated_at();

-- ─── 4. Función: calcular nivel desde XP ─────────────────────────────────────
-- Niveles: 1→0 XP, 2→500, 3→1500, 4→3500, 5→7000, 6→12000, 7→20000
CREATE OR REPLACE FUNCTION public.xp_to_level(xp_val INT)
RETURNS INT AS $$
BEGIN
  RETURN CASE
    WHEN xp_val < 500   THEN 1
    WHEN xp_val < 1500  THEN 2
    WHEN xp_val < 3500  THEN 3
    WHEN xp_val < 7000  THEN 4
    WHEN xp_val < 12000 THEN 5
    WHEN xp_val < 20000 THEN 6
    ELSE 7
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ─── 5. Función: XP mínimo para llegar al siguiente nivel ────────────────────
CREATE OR REPLACE FUNCTION public.xp_next_level(xp_val INT)
RETURNS INT AS $$
BEGIN
  RETURN CASE
    WHEN xp_val < 500   THEN 500
    WHEN xp_val < 1500  THEN 1500
    WHEN xp_val < 3500  THEN 3500
    WHEN xp_val < 7000  THEN 7000
    WHEN xp_val < 12000 THEN 12000
    WHEN xp_val < 20000 THEN 20000
    ELSE 20000
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ─── 6. Trigger: sincronizar nova_cv_score cuando nova_analyses se inserta ───
CREATE OR REPLACE FUNCTION public.sync_nova_cv_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.candidate_profiles
  SET nova_cv_score = NEW.score_general
  WHERE id = NEW.user_id;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING '[sync_nova_cv_score] error: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS nova_analyses_sync_score ON public.nova_analyses;
CREATE TRIGGER nova_analyses_sync_score
  AFTER INSERT ON public.nova_analyses
  FOR EACH ROW EXECUTE FUNCTION public.sync_nova_cv_score();
