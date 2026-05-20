import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  getOfferings,
  purchaseLumioPlus,
  restorePurchases,
  checkEntitlement,
  RCPackage,
  RCOfferings,
  LumioPurchaseResult,
} from '../services/revenuecatService'

// Backward-compat alias for callers that still import PurchaseResult from this hook
export type PurchaseResult = LumioPurchaseResult

export interface PurchaseState {
  offerings:        RCOfferings | null
  loadingOfferings: boolean
  purchasing:       boolean
  restoring:        boolean
  loadOfferings:    () => Promise<void>
  purchase:         (pkg: RCPackage) => Promise<LumioPurchaseResult>
  restore:          () => Promise<LumioPurchaseResult>
}

// Poll profiles.plan after purchase/restore — RevenueCat webhook updates it asynchronously
async function syncSupabasePlan(userId: string): Promise<void> {
  for (let i = 0; i < 6; i++) {
    const { data } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single()
    if (data?.plan === 'plus') return
    if (i < 5) await new Promise(r => setTimeout(r, 2500))
  }
}

export function usePurchase(userId: string, onPlusRestored?: () => void): PurchaseState {
  const [offerings,        setOfferings]        = useState<RCOfferings | null>(null)
  const [loadingOfferings, setLoadingOfferings] = useState(false)
  const [purchasing,       setPurchasing]       = useState(false)
  const [restoring,        setRestoring]        = useState(false)

  // On mount: silently check if the user already has an active entitlement
  useEffect(() => {
    if (!userId) return
    checkEntitlement()
      .then(active => { if (active) onPlusRestored?.() })
      .catch(() => {})
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadOfferings = useCallback(async () => {
    setLoadingOfferings(true)
    const result = await getOfferings()
    setOfferings(result)
    setLoadingOfferings(false)
  }, [])

  const purchase = useCallback(async (pkg: RCPackage): Promise<LumioPurchaseResult> => {
    setPurchasing(true)
    const result = await purchaseLumioPlus(pkg)
    if (result.entitlementActive) {
      syncSupabasePlan(userId).catch(() => {})
    }
    setPurchasing(false)
    return result
  }, [userId])

  const restore = useCallback(async (): Promise<LumioPurchaseResult> => {
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
