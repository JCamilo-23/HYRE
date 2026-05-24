-- HYRE AI Interview Engine — production schema
-- Apply via Supabase SQL editor or migration tool

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL,
  recruiter_id UUID,
  job_id UUID,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'live', 'processing', 'completed', 'cancelled', 'failed')),
  mode TEXT NOT NULL DEFAULT 'live'
    CHECK (mode IN ('live', 'copilot', 'async', 'practice')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interview_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  latency_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interview_events_interview_id ON interview_events(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_events_type ON interview_events(event_type);

CREATE TABLE IF NOT EXISTS interview_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('system', 'interviewer', 'candidate', 'ai')),
  content TEXT NOT NULL,
  transcript_confidence REAL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interview_messages_interview_id ON interview_messages(interview_id);

CREATE TABLE IF NOT EXISTS candidate_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id UUID NOT NULL UNIQUE REFERENCES interviews(id) ON DELETE CASCADE,
  overall_score REAL NOT NULL,
  hire_probability REAL NOT NULL,
  skill_match_pct REAL NOT NULL,
  confidence_score REAL NOT NULL,
  authenticity_score REAL NOT NULL,
  content_score REAL NOT NULL,
  audio_score REAL NOT NULL,
  facial_score REAL NOT NULL,
  dimensions JSONB NOT NULL DEFAULT '{}',
  recommendation TEXT NOT NULL,
  red_flags JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recruiter_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  recruiter_id UUID NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  agreed_with_ai BOOLEAN,
  notes TEXT,
  weight_overrides JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS realtime_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  metric_key TEXT NOT NULL,
  metric_value REAL NOT NULL,
  window_ms INTEGER NOT NULL DEFAULT 1000,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_realtime_metrics_interview ON realtime_metrics(interview_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS ai_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  analyzer TEXT NOT NULL,
  raw_output JSONB NOT NULL DEFAULT '{}',
  tokens_used INTEGER DEFAULT 0,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ml_training_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id UUID REFERENCES interviews(id) ON DELETE SET NULL,
  feature_vector JSONB NOT NULL,
  label JSONB NOT NULL,
  source TEXT NOT NULL DEFAULT 'production',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feature_store (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  features JSONB NOT NULL,
  version TEXT NOT NULL DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_store_entity ON feature_store(entity_type, entity_id);

CREATE TABLE IF NOT EXISTS model_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_name TEXT NOT NULL,
  version TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  metrics JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(model_name, version)
);
