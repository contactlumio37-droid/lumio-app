import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import {
  getOfferings,
  purchaseLumioPlus,
  restorePurchases,
  RCPackage,
  RCOfferings,
  PurchaseResult,
} from '../services/revenuecatService'

export interface PurchaseState {
  offerings: RCOfferings | null
  loadingOfferings: boolean
  purchasing: boolean
  restoring: boolean
  loadOfferings: () => Promise<void>
  purchase: (pkg: RCPackage) => Promise<PurchaseResult>
  restore: () => Promise<PurchaseResult>
}

async function syncSupabasePlan(userId: string): Promise<void> {
  for (let i = 0; i < 8; i++) {
    const { data } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single()
    if (data?.plan === 'plus') return
    if (i < 7) await new Promise(r => setTimeout(r, 2000))
  }
}

export function usePurchase(userId: string): PurchaseState {
  const [offerings, setOfferings] = useState<RCOfferings | null>(null)
  const [loadingOfferings, setLoadingOfferings] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [restoring, setRestoring] = useState(false)

  const loadOfferings = useCallback(async () => {
    setLoadingOfferings(true)
    const result = await getOfferings()
    setOfferings(result)
    setLoadingOfferings(false)
  }, [])

  const purchase = useCallback(async (pkg: RCPackage): Promise<PurchaseResult> => {
    setPurchasing(true)
    const result = await purchaseLumioPlus(pkg)
    if (result.entitlementActive) {
      syncSupabasePlan(userId).catch(() => {})
    }
    setPurchasing(false)
    return result
  }, [userId])

  const restore = useCallback(async (): Promise<PurchaseResult> => {
    setRestoring(true)
    const result = await restorePurchases()
    if (result.entitlementActive) {
      syncSupabasePlan(userId).catch(() => {})
    }
    setRestoring(false)
    return result
  }, [userId])

  return { offerings, loadingOfferings, purchasing, restoring, loadOfferings, purchase, restore }
}
