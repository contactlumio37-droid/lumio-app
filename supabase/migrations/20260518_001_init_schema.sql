-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table profiles
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT,
  language      TEXT NOT NULL DEFAULT 'fr' CHECK (language IN ('fr','en','es','de','it','pt')),
  gender        TEXT CHECK (gender IN ('m','f','n')),
  companion_animal TEXT CHECK (companion_animal IN ('otter','hedgehog','fox','koala','axolotl')),
  plan          TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','plus')),
  revenuecat_id TEXT UNIQUE,
  onboarding_done BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table daily_snapshots
CREATE TABLE public.daily_snapshots (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date              DATE NOT NULL,
  mood_morning      SMALLINT CHECK (mood_morning BETWEEN 1 AND 5),
  mood_evening      SMALLINT CHECK (mood_evening BETWEEN 1 AND 5),
  emotion_primary   TEXT CHECK (emotion_primary IN ('colere','tristesse','joie','stress','peur','neutre')),
  emotion_intensity SMALLINT CHECK (emotion_intensity BETWEEN 1 AND 5),
  sleep_quality     SMALLINT CHECK (sleep_quality BETWEEN 1 AND 5),
  sleep_hours       NUMERIC(3,1),
  checkout_done     BOOLEAN NOT NULL DEFAULT false,
  checkout_time     TIME,
  tomorrow_todo_1   TEXT CHECK (char_length(tomorrow_todo_1) <= 200),
  tomorrow_todo_2   TEXT CHECK (char_length(tomorrow_todo_2) <= 200),
  decharge_text     TEXT,
  decharge_length   INTEGER,
  pulse_triggered   BOOLEAN NOT NULL DEFAULT false,
  pulse_type        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Table trackers
CREATE TABLE public.trackers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug        TEXT NOT NULL,
  label       TEXT NOT NULL,
  icon        TEXT,
  type        TEXT NOT NULL CHECK (type IN ('bool','scale3','scale5','counter')),
  active      BOOLEAN NOT NULL DEFAULT true,
  order_index SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, slug)
);

-- Table tracker_entries
CREATE TABLE public.tracker_entries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  snapshot_id UUID NOT NULL REFERENCES public.daily_snapshots(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tracker_id  UUID NOT NULL REFERENCES public.trackers(id) ON DELETE CASCADE,
  value_bool  BOOLEAN,
  value_int   SMALLINT,
  date        DATE NOT NULL,
  UNIQUE(snapshot_id, tracker_id)
);

-- Table objectives
CREATE TABLE public.objectives (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('checklist','value','counter')),
  target       NUMERIC,
  current      NUMERIC NOT NULL DEFAULT 0,
  unit         TEXT,
  active       BOOLEAN NOT NULL DEFAULT true,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pulse_log
CREATE TABLE public.pulse_log (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trigger_type     TEXT NOT NULL,
  notif_sent_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  notif_text       TEXT,
  user_opened      BOOLEAN DEFAULT false,
  user_responded   BOOLEAN DEFAULT false
);

-- Table journal_entries
CREATE TABLE public.journal_entries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  mode            TEXT NOT NULL CHECK (mode IN ('journal','flux')),
  content         TEXT,
  emotion_context TEXT,
  word_count      INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index critiques pour les requêtes Pulse
CREATE INDEX idx_snapshots_user_date ON public.daily_snapshots(user_id, date DESC);
CREATE INDEX idx_snapshots_mood ON public.daily_snapshots(user_id, mood_evening, date DESC);
CREATE INDEX idx_snapshots_sleep ON public.daily_snapshots(user_id, sleep_quality, date DESC);
CREATE INDEX idx_tracker_entries_user_date ON public.tracker_entries(user_id, date DESC);
CREATE INDEX idx_pulse_log_user ON public.pulse_log(user_id, notif_sent_at DESC);
CREATE INDEX idx_journal_user_date ON public.journal_entries(user_id, date DESC);

-- Trigger updated_at sur profiles
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
