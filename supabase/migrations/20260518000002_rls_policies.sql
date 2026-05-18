-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trackers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracker_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objectives      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_log       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Helpers
CREATE OR REPLACE FUNCTION auth_uid() RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE sql STABLE;

-- Policies profiles
-- L'utilisateur lit et met à jour son propre profil
-- INTERDIT : modifier plan, revenuecat_id (réservés aux Edge Functions)
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = auth_uid());

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (id = auth_uid());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth_uid())
  WITH CHECK (
    id = auth_uid()
    -- plan et revenuecat_id ne peuvent pas être modifiés par le client
    AND (plan = (SELECT plan FROM public.profiles WHERE id = auth_uid()))
    AND (revenuecat_id IS NOT DISTINCT FROM (SELECT revenuecat_id FROM public.profiles WHERE id = auth_uid()))
  );

-- Policies daily_snapshots
CREATE POLICY "snapshots_own" ON public.daily_snapshots
  FOR ALL USING (user_id = auth_uid()) WITH CHECK (user_id = auth_uid());

-- Policies trackers
CREATE POLICY "trackers_own" ON public.trackers
  FOR ALL USING (user_id = auth_uid()) WITH CHECK (user_id = auth_uid());

-- Policies tracker_entries
CREATE POLICY "tracker_entries_own" ON public.tracker_entries
  FOR ALL USING (user_id = auth_uid()) WITH CHECK (user_id = auth_uid());

-- Policies objectives
-- Plan free : max 2 objectifs actifs
CREATE POLICY "objectives_select_own" ON public.objectives
  FOR SELECT USING (user_id = auth_uid());

CREATE POLICY "objectives_insert_own" ON public.objectives
  FOR INSERT WITH CHECK (
    user_id = auth_uid()
    AND (
      (SELECT plan FROM public.profiles WHERE id = auth_uid()) = 'plus'
      OR (SELECT COUNT(*) FROM public.objectives WHERE user_id = auth_uid() AND active = true) < 2
    )
  );

CREATE POLICY "objectives_update_own" ON public.objectives
  FOR UPDATE USING (user_id = auth_uid()) WITH CHECK (user_id = auth_uid());

CREATE POLICY "objectives_delete_own" ON public.objectives
  FOR DELETE USING (user_id = auth_uid());

-- Policies pulse_log (lecture seule pour le client)
CREATE POLICY "pulse_log_select_own" ON public.pulse_log
  FOR SELECT USING (user_id = auth_uid());
-- INSERT uniquement par Edge Functions via service_role

-- Policies journal_entries
-- Plan free : max 5 entrées
CREATE POLICY "journal_select_own" ON public.journal_entries
  FOR SELECT USING (user_id = auth_uid());

CREATE POLICY "journal_insert_own" ON public.journal_entries
  FOR INSERT WITH CHECK (
    user_id = auth_uid()
    AND (
      (SELECT plan FROM public.profiles WHERE id = auth_uid()) = 'plus'
      OR (SELECT COUNT(*) FROM public.journal_entries WHERE user_id = auth_uid()) < 5
    )
  );

CREATE POLICY "journal_update_own" ON public.journal_entries
  FOR UPDATE USING (user_id = auth_uid()) WITH CHECK (user_id = auth_uid());

CREATE POLICY "journal_delete_own" ON public.journal_entries
  FOR DELETE USING (user_id = auth_uid());
