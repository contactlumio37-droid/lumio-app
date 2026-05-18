-- Limite trackers plan free : max 3 actifs
-- Géré par policy d'insertion
CREATE POLICY "trackers_insert_own" ON public.trackers
  FOR INSERT WITH CHECK (
    user_id = auth_uid()
    AND (
      (SELECT plan FROM public.profiles WHERE id = auth_uid()) = 'plus'
      OR (SELECT COUNT(*) FROM public.trackers WHERE user_id = auth_uid() AND active = true) < 3
    )
  );
