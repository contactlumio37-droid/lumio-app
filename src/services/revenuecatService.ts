import { Purchases } from '@revenuecat/purchases-js'

const API_KEY = (import.meta as { env: Record<string, string> }).env.VITE_REVENUECAT_API_KEY ?? ''
const ENTITLEMENT = 'lumio_plus'

let instance: Purchases | null = null

export interface PurchaseResult {
  success: boolean
  entitlementActive: boolean
  error?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RCPackage = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RCOfferings = any

export async function initRevenueCat(userId: string): Promise<void> {
  if (!API_KEY) {
    console.warn('[RevenueCat] VITE_REVENUECAT_API_KEY manquant — ignoré')
    return
  }
  try {
    instance = Purchases.configure(API_KEY, userId)
  } catch (e) {
    console.warn('[RevenueCat] init échoué:', e)
  }
}

export async function getOfferings(): Promise<RCOfferings | null> {
  if (!instance) return null
  try {
    return await instance.getOfferings()
  } catch {
    return null
  }
}

export async function purchaseLumioPlus(rcPackage: RCPackage): Promise<PurchaseResult> {
  if (!instance) return { success: false, entitlementActive: false, error: 'not_initialized' }
  try {
    const { customerInfo } = await instance.purchase({ rcPackage })
    const entitlementActive = ENTITLEMENT in customerInfo.entitlements.active
    return { success: true, entitlementActive }
  } catch (e: unknown) {
    const err = e as { errorCode?: string; message?: string }
    if (err?.errorCode === 'user_cancelled' || err?.message?.toLowerCase().includes('cancel')) {
      return { success: false, entitlementActive: false, error: 'cancelled' }
    }
    return { success: false, entitlementActive: false, error: err?.message ?? 'unknown' }
  }
}

export async function restorePurchases(): Promise<PurchaseResult> {
  if (!instance) return { success: false, entitlementActive: false, error: 'not_initialized' }
  try {
    const { customerInfo } = await instance.restorePurchases()
    const entitlementActive = ENTITLEMENT in customerInfo.entitlements.active
    return { success: entitlementActive, entitlementActive }
  } catch (e: unknown) {
    const err = e as { message?: string }
    return { success: false, entitlementActive: false, error: err?.message ?? 'unknown' }
  }
}

export async function checkEntitlement(): Promise<boolean> {
  if (!instance) return false
  try {
    const { customerInfo } = await instance.getCustomerInfo()
    return ENTITLEMENT in customerInfo.entitlements.active
  } catch {
    return false
  }
}
