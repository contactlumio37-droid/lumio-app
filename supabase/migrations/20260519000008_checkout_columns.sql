-- Add joy_note column to daily_snapshots for the joie emotion flow
-- (captures "petits bonheurs" during a positive emotional checkout)
ALTER TABLE public.daily_snapshots
  ADD COLUMN IF NOT EXISTS joy_note TEXT CHECK (char_length(joy_note) <= 300);
