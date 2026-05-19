-- ── Retour Supabase Auth pur ──────────────────────────────────────────────────
-- Supprime toute policy hybride Firebase résiduelle (idempotent — IF EXISTS)
DROP POLICY IF EXISTS "profiles_select_firebase"     ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_firebase"     ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_firebase"     ON public.profiles;
DROP POLICY IF EXISTS "snapshots_firebase"           ON public.daily_snapshots;
DROP POLICY IF EXISTS "trackers_select_firebase"     ON public.trackers;
DROP POLICY IF EXISTS "trackers_insert_firebase"     ON public.trackers;
DROP POLICY IF EXISTS "trackers_update_firebase"     ON public.trackers;
DROP POLICY IF EXISTS "trackers_delete_firebase"     ON public.trackers;
DROP POLICY IF EXISTS "tracker_entries_firebase"     ON public.tracker_entries;
DROP POLICY IF EXISTS "objectives_select_firebase"   ON public.objectives;
DROP POLICY IF EXISTS "objectives_insert_firebase"   ON public.objectives;
DROP POLICY IF EXISTS "objectives_update_firebase"   ON public.objectives;
DROP POLICY IF EXISTS "objectives_delete_firebase"   ON public.objectives;
DROP POLICY IF EXISTS "pulse_log_select_firebase"    ON public.pulse_log;
DROP POLICY IF EXISTS "journal_select_firebase"      ON public.journal_entries;
DROP POLICY IF EXISTS "journal_insert_firebase"      ON public.journal_entries;
DROP POLICY IF EXISTS "journal_update_firebase"      ON public.journal_entries;
DROP POLICY IF EXISTS "journal_delete_firebase"      ON public.journal_entries;
DROP FUNCTION IF EXISTS get_profile_id_from_firebase();

-- ── Recrée proprement les policies Supabase Auth (auth.uid()) ─────────────────
-- (idempotent — DROP IF EXISTS avant CREATE)

-- profiles
DROP POLICY IF EXISTS "profiles_select_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"  ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND plan IS NOT DISTINCT FROM
      (SELECT plan FROM public.profiles WHERE id = auth.uid())
    AND revenuecat_id IS NOT DISTINCT FROM
      (SELECT revenuecat_id FROM public.profiles WHERE id = auth.uid())
  );

-- daily_snapshots
DROP POLICY IF EXISTS "snapshots_own" ON public.daily_snapshots;
CREATE POLICY "snapshots_own" ON public.daily_snapshots
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- trackers
DROP POLICY IF EXISTS "trackers_own"          ON public.trackers;
DROP POLICY IF EXISTS "trackers_select_own"   ON public.trackers;
DROP POLICY IF EXISTS "trackers_insert_own"   ON public.trackers;
DROP POLICY IF EXISTS "trackers_update_own"   ON public.trackers;
DROP POLICY IF EXISTS "trackers_delete_own"   ON public.trackers;

CREATE POLICY "trackers_select_own" ON public.trackers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "trackers_insert_own" ON public.trackers
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND (
      (SELECT plan FROM public.profiles WHERE id = auth.uid()) = 'plus'
      OR (SELECT COUNT(*) FROM public.trackers
          WHERE user_id = auth.uid() AND active = true) < 3
    )
  );

CREATE POLICY "trackers_update_own" ON public.trackers
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "trackers_delete_own" ON public.trackers
  FOR DELETE USING (user_id = auth.uid());

-- tracker_entries
DROP POLICY IF EXISTS "tracker_entries_own" ON public.tracker_entries;
CREATE POLICY "tracker_entries_own" ON public.tracker_entries
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- objectives
DROP POLICY IF EXISTS "objectives_select_own" ON public.objectives;
DROP POLICY IF EXISTS "objectives_insert_own" ON public.objectives;
DROP POLICY IF EXISTS "objectives_update_own" ON public.objectives;
DROP POLICY IF EXISTS "objectives_delete_own" ON public.objectives;

CREATE POLICY "objectives_select_own" ON public.objectives
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "objectives_insert_own" ON public.objectives
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND (
      (SELECT plan FROM public.profiles WHERE id = auth.uid()) = 'plus'
      OR (SELECT COUNT(*) FROM public.objectives
          WHERE user_id = auth.uid() AND active = true) < 2
    )
  );

CREATE POLICY "objectives_update_own" ON public.objectives
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "objectives_delete_own" ON public.objectives
  FOR DELETE USING (user_id = auth.uid());

-- pulse_log (lecture seule client)
DROP POLICY IF EXISTS "pulse_log_select_own" ON public.pulse_log;
CREATE POLICY "pulse_log_select_own" ON public.pulse_log
  FOR SELECT USING (user_id = auth.uid());

-- journal_entries
DROP POLICY IF EXISTS "journal_select_own" ON public.journal_entries;
DROP POLICY IF EXISTS "journal_insert_own" ON public.journal_entries;
DROP POLICY IF EXISTS "journal_update_own" ON public.journal_entries;
DROP POLICY IF EXISTS "journal_delete_own" ON public.journal_entries;

CREATE POLICY "journal_select_own" ON public.journal_entries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "journal_insert_own" ON public.journal_entries
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND (
      (SELECT plan FROM public.profiles WHERE id = auth.uid()) = 'plus'
      OR (SELECT COUNT(*) FROM public.journal_entries
          WHERE user_id = auth.uid()) < 5
    )
  );

CREATE POLICY "journal_update_own" ON public.journal_entries
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "journal_delete_own" ON public.journal_entries
  FOR DELETE USING (user_id = auth.uid());
