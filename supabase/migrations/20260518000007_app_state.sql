-- Add app-state JSONB columns to profiles so the client can persist
-- all user preferences and data without separate subcollection documents.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS theme            TEXT    DEFAULT 'dark',
  ADD COLUMN IF NOT EXISTS accent           TEXT    DEFAULT '#7C9EFF',
  ADD COLUMN IF NOT EXISTS first_name       TEXT,
  ADD COLUMN IF NOT EXISTS last_name        TEXT,
  ADD COLUMN IF NOT EXISTS notifications    BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS reminder_time    TEXT    DEFAULT '20:00',
  ADD COLUMN IF NOT EXISTS moods            JSONB   NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS trackers         JSONB   NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS widgets          JSONB   NOT NULL DEFAULT '["objectives","weekMoods","streaks","aiInsight"]'::jsonb,
  ADD COLUMN IF NOT EXISTS objectives       JSONB   NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS journal_entries  JSONB   NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS days_data        JSONB   NOT NULL DEFAULT '{}'::jsonb;

-- Expand roadmap status to include values used by the admin UI
ALTER TABLE public.roadmap DROP CONSTRAINT IF EXISTS roadmap_status_check;
ALTER TABLE public.roadmap ADD CONSTRAINT roadmap_status_check
  CHECK (status IN ('soon','in_progress','done','building','later'));
