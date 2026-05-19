import { useEffect, useState, useCallback } from 'react'
import { getTodaySnapshot, getStreak } from '../services/checkoutService'
import {
  getCompanionState,
  getCompanionConfig,
  getCompanionAssetPath,
  type Animal,
  type CompanionState,
  type CompanionConfig,
} from '../services/companionService'
import type { DailySnapshot } from '../services/checkoutService'

export function useCompanion(
  userId: string,
  animal: Animal | null | undefined,
  lang:   string,
) {
  const resolvedAnimal: Animal = animal ?? 'otter'

  const [snapshot, setSnapshot] = useState<DailySnapshot | null>(null)
  const [streak,   setStreak]   = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [tick,     setTick]     = useState(0)

  const refresh = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    let cancelled = false

    async function load() {
      setLoading(true)
      const [snap, s] = await Promise.all([
        getTodaySnapshot(userId).catch(() => null),
        getStreak(userId).catch(() => 0),
      ])
      if (!cancelled) {
        setSnapshot(snap)
        setStreak(s)
        setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [userId, tick])

  const hour:  number        = new Date().getHours()
  const state: CompanionState = getCompanionState(snapshot, streak, hour)
  const config: CompanionConfig = getCompanionConfig(resolvedAnimal, state, lang, streak, userId)

  return {
    // Backward-compat fields (utilisés par LumioApp.jsx)
    animal:    resolvedAnimal,
    state,
    message:   config.message,
    assetPath: getCompanionAssetPath(resolvedAnimal, state),
    streak,
    snapshot,
    loading,
    refresh,
    // Nouveau
    config,
    refetch: refresh,
  }
}
