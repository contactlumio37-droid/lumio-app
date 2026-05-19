-- ── is_admin column ──────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- ── profiles_update_own : enforce JSONB freemium limits + protect is_admin ───
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Protect server-managed columns from client writes
    AND plan IS NOT DISTINCT FROM
        (SELECT plan FROM public.profiles WHERE id = auth.uid())
    AND revenuecat_id IS NOT DISTINCT FROM
        (SELECT revenuecat_id FROM public.profiles WHERE id = auth.uid())
    AND is_admin IS NOT DISTINCT FROM
        (SELECT is_admin FROM public.profiles WHERE id = auth.uid())
    -- Enforce freemium JSONB array limits (only when the column actually changes)
    AND (
      (SELECT plan FROM public.profiles WHERE id = auth.uid()) = 'plus'
      OR (
        (trackers       = (SELECT trackers       FROM public.profiles WHERE id = auth.uid())
         OR jsonb_array_length(COALESCE(trackers, '[]'::jsonb)) <= 3)
        AND
        (objectives     = (SELECT objectives     FROM public.profiles WHERE id = auth.uid())
         OR jsonb_array_length(COALESCE(objectives, '[]'::jsonb)) <= 2)
        AND
        (journal_entries = (SELECT journal_entries FROM public.profiles WHERE id = auth.uid())
         OR jsonb_array_length(COALESCE(journal_entries, '[]'::jsonb)) <= 5)
      )
    )
  );

-- ── feedbacks : admin UPDATE via is_admin flag ─────────────────────────────
DROP POLICY IF EXISTS "feedbacks_update_admin" ON public.feedbacks;

CREATE POLICY "feedbacks_update_admin" ON public.feedbacks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
