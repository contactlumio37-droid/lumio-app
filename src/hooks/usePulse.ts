import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { DailySnapshot } from '../services/checkoutService'

interface PulseState {
  active: boolean
  triggerType: string | null
  logId: string | null
  loading: boolean
  dismiss: () => void
}

export function usePulse(snapshot: DailySnapshot | null, userId: string): PulseState {
  const [logId, setLogId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const triggerType = snapshot?.pulse_type ?? null
  const active = !dismissed && (snapshot?.pulse_triggered ?? false) && triggerType !== null

  // Fetch the pulse_log id so we can mark user_responded
  useEffect(() => {
    if (!active || !userId || !triggerType) return
    let cancelled = false

    supabase
      .from('pulse_log')
      .select('id')
      .eq('user_id', userId)
      .eq('trigger_type', triggerType)
      .is('user_responded', null)
      .order('notif_sent_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (!cancelled && data?.[0]) setLogId(data[0].id)
      })

    return () => { cancelled = true }
  }, [active, userId, triggerType])

  const dismiss = useCallback(() => {
    setDismissed(true)
    if (!logId) return
    setLoading(true)
    supabase
      .from('pulse_log')
      .update({ user_responded: true })
      .eq('id', logId)
      .then(() => setLoading(false))
      .catch(() => setLoading(false))
  }, [logId])

  return { active, triggerType, logId, loading, dismiss }
}
