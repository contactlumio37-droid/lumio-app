-- Recreate pulse detection functions with SET search_path = '' (M-1)
-- Prevents search_path injection by fully qualifying all table references.

CREATE OR REPLACE FUNCTION public.pulse_check_bad_sleep()
RETURNS TABLE(user_id UUID) AS $$
  SELECT DISTINCT s1.user_id
  FROM public.daily_snapshots s1
  JOIN public.daily_snapshots s2 ON s2.user_id = s1.user_id
    AND s2.date = s1.date - INTERVAL '1 day'
  WHERE s1.sleep_quality <= 2
    AND s2.sleep_quality <= 2
    AND s1.date = CURRENT_DATE - 1
    AND NOT EXISTS (
      SELECT 1 FROM public.pulse_log pl
      WHERE pl.user_id = s1.user_id
        AND pl.trigger_type = 'bad_sleep'
        AND pl.notif_sent_at > NOW() - INTERVAL '48 hours'
    );
$$ LANGUAGE sql STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION public.pulse_check_low_mood()
RETURNS TABLE(user_id UUID) AS $$
  SELECT user_id
  FROM public.daily_snapshots
  WHERE date >= CURRENT_DATE - 3
  GROUP BY user_id
  HAVING AVG(mood_evening) < 2.5
    AND COUNT(*) >= 3
    AND user_id NOT IN (
      SELECT user_id FROM public.pulse_log
      WHERE trigger_type = 'low_mood'
        AND notif_sent_at > NOW() - INTERVAL '48 hours'
    );
$$ LANGUAGE sql STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION public.pulse_check_absence()
RETURNS TABLE(user_id UUID) AS $$
  SELECT p.id AS user_id
  FROM public.profiles p
  WHERE p.onboarding_done = true
    AND NOT EXISTS (
      SELECT 1 FROM public.daily_snapshots ds
      WHERE ds.user_id = p.id
        AND ds.checkout_done = true
        AND ds.date >= CURRENT_DATE - 2
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.pulse_log pl
      WHERE pl.user_id = p.id
        AND pl.trigger_type = 'absence'
        AND pl.notif_sent_at > NOW() - INTERVAL '48 hours'
    );
$$ LANGUAGE sql STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION public.pulse_check_streak()
RETURNS TABLE(user_id UUID) AS $$
  WITH streaks AS (
    SELECT user_id,
           date,
           date - ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY date)::integer AS grp
    FROM public.daily_snapshots
    WHERE checkout_done = true
  )
  SELECT user_id
  FROM streaks
  GROUP BY user_id, grp
  HAVING COUNT(*) = 7
    AND MAX(date) = CURRENT_DATE - 1
    AND user_id NOT IN (
      SELECT user_id FROM public.pulse_log
      WHERE trigger_type = 'streak_7'
        AND notif_sent_at > NOW() - INTERVAL '48 hours'
    );
$$ LANGUAGE sql STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION public.pulse_check_rebound()
RETURNS TABLE(user_id UUID) AS $$
  SELECT s_today.user_id
  FROM public.daily_snapshots s_today
  WHERE s_today.date = CURRENT_DATE - 1
    AND s_today.mood_evening >= 4
    AND (
      SELECT AVG(mood_evening)
      FROM public.daily_snapshots
      WHERE user_id = s_today.user_id
        AND date BETWEEN CURRENT_DATE - 4 AND CURRENT_DATE - 2
    ) <= 2
    AND NOT EXISTS (
      SELECT 1 FROM public.pulse_log pl
      WHERE pl.user_id = s_today.user_id
        AND pl.trigger_type = 'rebound'
        AND pl.notif_sent_at > NOW() - INTERVAL '48 hours'
    );
$$ LANGUAGE sql STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION public.pulse_check_anger()
RETURNS TABLE(user_id UUID) AS $$
  SELECT user_id
  FROM public.daily_snapshots
  WHERE emotion_primary = 'colere'
    AND date >= CURRENT_DATE - 7
  GROUP BY user_id
  HAVING COUNT(*) >= 3
    AND user_id NOT IN (
      SELECT user_id FROM public.pulse_log
      WHERE trigger_type = 'anger_repeat'
        AND notif_sent_at > NOW() - INTERVAL '48 hours'
    );
$$ LANGUAGE sql STABLE SET search_path = '';

CREATE OR REPLACE FUNCTION public.pulse_check_alert()
RETURNS TABLE(user_id UUID) AS $$
  SELECT user_id
  FROM public.daily_snapshots
  WHERE mood_evening <= 1
    AND date >= CURRENT_DATE - 5
  GROUP BY user_id
  HAVING COUNT(*) >= 5
    AND user_id NOT IN (
      SELECT user_id FROM public.pulse_log
      WHERE trigger_type = 'alert_threshold'
        AND notif_sent_at > NOW() - INTERVAL '168 hours'
    );
$$ LANGUAGE sql STABLE SET search_path = '';
