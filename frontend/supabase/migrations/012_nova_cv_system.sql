-- Nova CV Intelligence System
-- PRD-3 Phase 1: CV upload, analysis, versions

-- CVs subidos por usuarios
CREATE TABLE nova_cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Mi CV',
  file_url TEXT,
  file_type TEXT,
  raw_text TEXT,
  parsed_sections JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'ready', 'error')),
  is_primary BOOLEAN DEFAULT FALSE,
  industry TEXT,
  target_role TEXT,
  seniority TEXT,
  language TEXT DEFAULT 'es',
  word_count INT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Análisis generados por Nova
CREATE TABLE nova_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID REFERENCES nova_cvs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Scores (0-100)
  score_general INT,
  score_ats INT,
  score_technical INT,
  score_recruiter INT,
  score_visual INT,
  score_communication INT,

  -- Resultados estructurados
  strengths JSONB DEFAULT '[]',
  weaknesses JSONB DEFAULT '[]',
  ats_issues JSONB DEFAULT '[]',
  keyword_gaps JSONB DEFAULT '[]',
  bullets_analysis JSONB DEFAULT '[]',
  sections_detected TEXT[] DEFAULT '{}',
  sections_missing TEXT[] DEFAULT '{}',
  top_actions JSONB DEFAULT '[]',

  -- Feedback generado
  feedback_summary TEXT,
  feedback_detailed JSONB DEFAULT '{}',

  -- Metadata
  model_used TEXT DEFAULT 'gemini-1.5-flash',
  processing_time_ms INT,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Versiones reescritas/generadas del CV
CREATE TABLE nova_cv_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID REFERENCES nova_cvs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  version_type TEXT CHECK (version_type IN ('rewritten', 'generated', 'job_adapted')),
  template TEXT DEFAULT 'ats-clean',
  content JSONB DEFAULT '{}',
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: updated_at en nova_cvs
CREATE OR REPLACE FUNCTION update_nova_cvs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER nova_cvs_updated_at
  BEFORE UPDATE ON nova_cvs
  FOR EACH ROW EXECUTE FUNCTION update_nova_cvs_updated_at();

-- Solo un CV primario por usuario
CREATE UNIQUE INDEX nova_cvs_primary_idx
  ON nova_cvs(user_id)
  WHERE is_primary = TRUE;

-- RLS
ALTER TABLE nova_cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nova_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE nova_cv_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own CVs"
  ON nova_cvs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users see own analyses"
  ON nova_analyses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own CV versions"
  ON nova_cv_versions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Storage bucket for CV files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'nova-cvs',
  'nova-cvs',
  false,
  10485760, -- 10 MB
  ARRAY['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/msword','text/plain']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own CVs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'nova-cvs' AND auth.uid()::text = (storage.foldername(name))[2]);

CREATE POLICY "Users read own CVs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'nova-cvs' AND auth.uid()::text = (storage.foldername(name))[2]);
