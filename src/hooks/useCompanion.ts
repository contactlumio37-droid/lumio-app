import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getTodaySnapshot } from '../services/checkoutService'
import {
  getCompanionState,
  getCompanionMessage,
  getCompanionAssetPath,
} from '../services/companionService'
import type { Animal, CompanionState } from '../services/companionService'
import type { DailySnapshot } from '../services/checkoutService'

interface CompanionData {
  animal: Animal
  state: CompanionState
  message: string
  assetPath: string
  streak: number
  snapshot: DailySnapshot | null
  loading: boolean
  refresh: () => void
}

async function fetchStreak(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('daily_snapshots')
    .select('date, checkout_done')
    .eq('user_id', userId)
    .eq('checkout_done', true)
    .order('date', { ascending: false })
    .limit(90)

  if (error || !data) return 0

  let streak = 0
  const today = new Date()

  for (let i = 0; i < data.length; i++) {
    const expected = new Date(today)
    expected.setDate(today.getDate() - i)
    const expectedStr = expected.toISOString().slice(0, 10)

    if (data[i].date === expectedStr) {
      streak++
    } else {
      break
    }
  }

  return streak
}

export function useCompanion(
  userId: string,
  animal: Animal | null | undefined,
  lang: string,
): CompanionData {
  const resolvedAnimal: Animal = animal ?? 'otter'

  const [snapshot, setSnapshot] = useState<DailySnapshot | null>(null)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick(t => t + 1), [])

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      const [snap, s] = await Promise.all([
        getTodaySnapshot(userId),
        fetchStreak(userId),
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

  const state = getCompanionState(snapshot, streak)
  const message = getCompanionMessage(resolvedAnimal, state, lang)
  const assetPath = getCompanionAssetPath(resolvedAnimal, state)

  return { animal: resolvedAnimal, state, message, assetPath, streak, snapshot, loading, refresh }
}
