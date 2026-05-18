-- RLS policies for all user tables.
-- This migration runs after 20260518_001_init_schema.sql (lex order: _002 > _001).
-- The earlier 20260518000002/000003 files sort before the init schema and therefore
-- failed to apply; this file supersedes them with DROP POLICY IF EXISTS guards.

ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trackers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracker_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objectives      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_log       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- auth_uid helper with fixed search_path to prevent search-path injection
CREATE OR REPLACE FUNCTION public.auth_uid()
RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '';

-- ── profiles ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = public.auth_uid());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (id = public.auth_uid());

-- Prevents clients from modifying plan/revenuecat_id (reserved for Edge Functions)
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = public.auth_uid())
  WITH CHECK (
    id = public.auth_uid()
    AND plan          = (SELECT plan          FROM public.profiles WHERE id = public.auth_uid())
    AND revenuecat_id IS NOT DISTINCT FROM
        (SELECT revenuecat_id FROM public.profiles WHERE id = public.auth_uid())
  );

-- ── daily_snapshots ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "snapshots_own" ON public.daily_snapshots;
CREATE POLICY "snapshots_own" ON public.daily_snapshots
  FOR ALL USING (user_id = public.auth_uid()) WITH CHECK (user_id = public.auth_uid());

-- ── trackers ──────────────────────────────────────────────────────────────────
-- Split ALL into SELECT/UPDATE/DELETE so the INSERT limit below is enforced.
-- (A permissive FOR ALL policy would short-circuit the INSERT limit via OR.)
DROP POLICY IF EXISTS "trackers_own"        ON public.trackers;
DROP POLICY IF EXISTS "trackers_select_own" ON public.trackers;
CREATE POLICY "trackers_select_own" ON public.trackers
  FOR SELECT USING (user_id = public.auth_uid());

DROP POLICY IF EXISTS "trackers_update_own" ON public.trackers;
CREATE POLICY "trackers_update_own" ON public.trackers
  FOR UPDATE USING (user_id = public.auth_uid()) WITH CHECK (user_id = public.auth_uid());

DROP POLICY IF EXISTS "trackers_delete_own" ON public.trackers;
CREATE POLICY "trackers_delete_own" ON public.trackers
  FOR DELETE USING (user_id = public.auth_uid());

-- Free plan: max 3 active trackers
DROP POLICY IF EXISTS "trackers_insert_own" ON public.trackers;
CREATE POLICY "trackers_insert_own" ON public.trackers
  FOR INSERT WITH CHECK (
    user_id = public.auth_uid()
    AND (
      (SELECT plan FROM public.profiles WHERE id = public.auth_uid()) = 'plus'
      OR (SELECT COUNT(*) FROM public.trackers WHERE user_id = public.auth_uid() AND active = true) < 3
    )
  );

-- ── tracker_entries ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "tracker_entries_own" ON public.tracker_entries;
CREATE POLICY "tracker_entries_own" ON public.tracker_entries
  FOR ALL USING (user_id = public.auth_uid()) WITH CHECK (user_id = public.auth_uid());

-- ── objectives ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "objectives_select_own" ON public.objectives;
CREATE POLICY "objectives_select_own" ON public.objectives
  FOR SELECT USING (user_id = public.auth_uid());

-- Free plan: max 2 active objectives
DROP POLICY IF EXISTS "objectives_insert_own" ON public.objectives;
CREATE POLICY "objectives_insert_own" ON public.objectives
  FOR INSERT WITH CHECK (
    user_id = public.auth_uid()
    AND (
      (SELECT plan FROM public.profiles WHERE id = public.auth_uid()) = 'plus'
      OR (SELECT COUNT(*) FROM public.objectives WHERE user_id = public.auth_uid() AND active = true) < 2
    )
  );

DROP POLICY IF EXISTS "objectives_update_own" ON public.objectives;
CREATE POLICY "objectives_update_own" ON public.objectives
  FOR UPDATE USING (user_id = public.auth_uid()) WITH CHECK (user_id = public.auth_uid());

DROP POLICY IF EXISTS "objectives_delete_own" ON public.objectives;
CREATE POLICY "objectives_delete_own" ON public.objectives
  FOR DELETE USING (user_id = public.auth_uid());

-- ── pulse_log ─────────────────────────────────────────────────────────────────
-- Read-only for clients; INSERT is handled by Edge Functions via service_role
DROP POLICY IF EXISTS "pulse_log_select_own" ON public.pulse_log;
CREATE POLICY "pulse_log_select_own" ON public.pulse_log
  FOR SELECT USING (user_id = public.auth_uid());

-- ── journal_entries ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "journal_select_own" ON public.journal_entries;
CREATE POLICY "journal_select_own" ON public.journal_entries
  FOR SELECT USING (user_id = public.auth_uid());

-- Free plan: max 5 journal entries
DROP POLICY IF EXISTS "journal_insert_own" ON public.journal_entries;
CREATE POLICY "journal_insert_own" ON public.journal_entries
  FOR INSERT WITH CHECK (
    user_id = public.auth_uid()
    AND (
      (SELECT plan FROM public.profiles WHERE id = public.auth_uid()) = 'plus'
      OR (SELECT COUNT(*) FROM public.journal_entries WHERE user_id = public.auth_uid()) < 5
    )
  );

DROP POLICY IF EXISTS "journal_update_own" ON public.journal_entries;
CREATE POLICY "journal_update_own" ON public.journal_entries
  FOR UPDATE USING (user_id = public.auth_uid()) WITH CHECK (user_id = public.auth_uid());

DROP POLICY IF EXISTS "journal_delete_own" ON public.journal_entries;
CREATE POLICY "journal_delete_own" ON public.journal_entries
  FOR DELETE USING (user_id = public.auth_uid());
