import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { DailySnapshot } from '../services/checkoutService'

interface PulseState {
  // Spec fields
  hasPulse:     boolean
  pulseType:    string | null
  pulseMessage: string | null
  dismiss:      () => void
  // Backward-compat aliases
  active:       boolean
  triggerType:  string | null
  logId:        string | null
  loading:      boolean
}

export function usePulse(snapshot: DailySnapshot | null, userId: string): PulseState {
  const [logId,      setLogId]      = useState<string | null>(null)
  const [pulseMsg,   setPulseMsg]   = useState<string | null>(null)
  const [loading,    setLoading]    = useState(false)
  const [dismissed,  setDismissed]  = useState(false)
  const [dismissing, setDismissing] = useState(false)

  const triggerType = snapshot?.pulse_type ?? null
  const active      = !dismissed && !dismissing && (snapshot?.pulse_triggered ?? false) && triggerType !== null

  // Fetch logId + notif_text from most recent unanswered pulse_log entry
  useEffect(() => {
    if (!active || !userId || !triggerType) return
    let cancelled = false

    supabase
      .from('pulse_log')
      .select('id, notif_text')
      .eq('user_id', userId)
      .eq('trigger_type', triggerType)
      .is('user_responded', null)
      .order('notif_sent_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (cancelled || !data?.[0]) return
        setLogId(data[0].id)
        setPulseMsg(data[0].notif_text ?? null)
      })

    return () => { cancelled = true }
  }, [active, userId, triggerType])

  const dismiss = useCallback(() => {
    setDismissing(true)           // déclenche fadeOut dans le composant
    setTimeout(() => setDismissed(true), 260)

    if (!logId) return
    setLoading(true)
    supabase
      .from('pulse_log')
      .update({ user_responded: true })
      .eq('id', logId)
      .then(() => setLoading(false))
      .catch(() => setLoading(false))
  }, [logId])

  return {
    hasPulse:     active,
    pulseType:    triggerType,
    pulseMessage: pulseMsg,
    dismiss,
    // Backward-compat
    active,
    triggerType,
    logId,
    loading,
  }
}
