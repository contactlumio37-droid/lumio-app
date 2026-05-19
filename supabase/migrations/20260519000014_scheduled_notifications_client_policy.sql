-- scheduled_notifications: Edge Functions write via service_role (bypasses RLS).
-- Adding an UPDATE policy so users can dismiss their own notifications client-side.

DROP POLICY IF EXISTS "scheduled_notif_update_own" ON public.scheduled_notifications;

CREATE POLICY "scheduled_notif_update_own" ON public.scheduled_notifications
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
