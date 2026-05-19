-- Pulse detection functions — called by pulse-runner Edge Function

-- bad_sleep: sleep_quality <= 2 on 2 consecutive nights
CREATE OR REPLACE FUNCTION pulse_check_bad_sleep()
RETURNS TABLE(user_id UUID) AS $$
  SELECT DISTINCT s1.user_id
  FROM daily_snapshots s1
  JOIN daily_snapshots s2 ON s2.user_id = s1.user_id
    AND s2.date = s1.date - INTERVAL '1 day'
  WHERE s1.sleep_quality <= 2
    AND s2.sleep_quality <= 2
    AND s1.date = CURRENT_DATE - 1
    AND NOT EXISTS (
      SELECT 1 FROM pulse_log pl
      WHERE pl.user_id = s1.user_id
        AND pl.trigger_type = 'bad_sleep'
        AND pl.notif_sent_at > NOW() - INTERVAL '48 hours'
    );
$$ LANGUAGE sql STABLE;

-- low_mood: average mood_evening < 2.5 over last 3 days
CREATE OR REPLACE FUNCTION pulse_check_low_mood()
RETURNS TABLE(user_id UUID) AS $$
  SELECT user_id
  FROM daily_snapshots
  WHERE date >= CURRENT_DATE - 3
  GROUP BY user_id
  HAVING AVG(mood_evening) < 2.5
    AND COUNT(*) >= 3
    AND user_id NOT IN (
      SELECT user_id FROM pulse_log
      WHERE trigger_type = 'low_mood'
        AND notif_sent_at > NOW() - INTERVAL '48 hours'
    );
$$ LANGUAGE sql STABLE;

-- absence: no checkout_done in last 48h
CREATE OR REPLACE FUNCTION pulse_check_absence()
RETURNS TABLE(user_id UUID) AS $$
  SELECT p.id AS user_id
  FROM profiles p
  WHERE p.onboarding_done = true
    AND NOT EXISTS (
      SELECT 1 FROM daily_snapshots ds
      WHERE ds.user_id = p.id
        AND ds.checkout_done = true
        AND ds.date >= CURRENT_DATE - 2
    )
    AND NOT EXISTS (
      SELECT 1 FROM pulse_log pl
      WHERE pl.user_id = p.id
        AND pl.trigger_type = 'absence'
        AND pl.notif_sent_at > NOW() - INTERVAL '48 hours'
    );
$$ LANGUAGE sql STABLE;

-- streak_7: exactly 7 consecutive checkout_done days ending yesterday
CREATE OR REPLACE FUNCTION pulse_check_streak()
RETURNS TABLE(user_id UUID) AS $$
  WITH streaks AS (
    SELECT user_id,
           date,
           date - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY date)::integer AS grp
    FROM daily_snapshots
    WHERE checkout_done = true
  )
  SELECT user_id
  FROM streaks
  GROUP BY user_id, grp
  HAVING COUNT(*) = 7
    AND MAX(date) = CURRENT_DATE - 1
    AND user_id NOT IN (
      SELECT user_id FROM pulse_log
      WHERE trigger_type = 'streak_7'
        AND notif_sent_at > NOW() - INTERVAL '48 hours'
    );
$$ LANGUAGE sql STABLE;

-- rebound: mood rises to >= 4 after 3 days of mood_evening <= 2
CREATE OR REPLACE FUNCTION pulse_check_rebound()
RETURNS TABLE(user_id UUID) AS $$
  SELECT s_today.user_id
  FROM daily_snapshots s_today
  WHERE s_today.date = CURRENT_DATE - 1
    AND s_today.mood_evening >= 4
    AND (
      SELECT AVG(mood_evening)
      FROM daily_snapshots
      WHERE user_id = s_today.user_id
        AND date BETWEEN CURRENT_DATE - 4 AND CURRENT_DATE - 2
    ) <= 2
    AND NOT EXISTS (
      SELECT 1 FROM pulse_log pl
      WHERE pl.user_id = s_today.user_id
        AND pl.trigger_type = 'rebound'
        AND pl.notif_sent_at > NOW() - INTERVAL '48 hours'
    );
$$ LANGUAGE sql STABLE;

-- anger_repeat: emotion_primary = 'colere' 3+ times in last 7 days
CREATE OR REPLACE FUNCTION pulse_check_anger()
RETURNS TABLE(user_id UUID) AS $$
  SELECT user_id
  FROM daily_snapshots
  WHERE emotion_primary = 'colere'
    AND date >= CURRENT_DATE - 7
  GROUP BY user_id
  HAVING COUNT(*) >= 3
    AND user_id NOT IN (
      SELECT user_id FROM pulse_log
      WHERE trigger_type = 'anger_repeat'
        AND notif_sent_at > NOW() - INTERVAL '48 hours'
    );
$$ LANGUAGE sql STABLE;

-- alert_threshold: mood_evening <= 1 for 5+ days in last 5 days
CREATE OR REPLACE FUNCTION pulse_check_alert()
RETURNS TABLE(user_id UUID) AS $$
  SELECT user_id
  FROM daily_snapshots
  WHERE mood_evening <= 1
    AND date >= CURRENT_DATE - 5
  GROUP BY user_id
  HAVING COUNT(*) >= 5
    AND user_id NOT IN (
      SELECT user_id FROM pulse_log
      WHERE trigger_type = 'alert_threshold'
        AND notif_sent_at > NOW() - INTERVAL '168 hours'
    );
$$ LANGUAGE sql STABLE;

-- scheduled_notifications table for morning nudges post-checkout
CREATE TABLE IF NOT EXISTS public.scheduled_notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  send_at     TIMESTAMPTZ NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  sent        BOOLEAN NOT NULL DEFAULT false,
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduled_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own scheduled_notifications"
  ON public.scheduled_notifications FOR SELECT
  USING (auth.uid() = user_id);

-- profiles.fcm_token for push notifications
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS fcm_token TEXT;
