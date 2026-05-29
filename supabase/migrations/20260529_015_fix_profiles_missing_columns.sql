-- Migration correctrice : ajoute les colonnes de la migration 20260518000007_app_state
-- si elles ne sont pas présentes dans l'instance remote.
-- Entièrement idempotente — IF NOT EXISTS sur chaque colonne.
-- Ne touche PAS aux colonnes existantes, ni aux contraintes, ni aux policies.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS theme           TEXT        NOT NULL DEFAULT 'dark',
  ADD COLUMN IF NOT EXISTS accent          TEXT        NOT NULL DEFAULT '#7C9EFF',
  ADD COLUMN IF NOT EXISTS first_name      TEXT,
  ADD COLUMN IF NOT EXISTS last_name       TEXT,
  ADD COLUMN IF NOT EXISTS notifications   BOOLEAN     NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS reminder_time   TEXT                 DEFAULT '20:00',
  ADD COLUMN IF NOT EXISTS moods           JSONB       NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS trackers        JSONB       NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS widgets         JSONB       NOT NULL DEFAULT '["objectives","weekMoods","streaks","aiInsight"]'::jsonb,
  ADD COLUMN IF NOT EXISTS objectives      JSONB       NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS journal_entries JSONB       NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS days_data       JSONB       NOT NULL DEFAULT '{}'::jsonb;

-- Vérification : après application, la table doit avoir ces colonnes.
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'profiles' ORDER BY ordinal_position;
