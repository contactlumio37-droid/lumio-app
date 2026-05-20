import {
  Purchases,
  Package,
  Offerings,
  ErrorCode,
  LogLevel,
  CustomerInfo,
} from '@revenuecat/purchases-js'

// Re-export SDK types consumed by usePurchase and PurchaseScreen
export type RCPackage  = Package
export type RCOfferings = Offerings

const API_KEY     = (import.meta as { env: Record<string, string> }).env.VITE_REVENUECAT_API_KEY ?? ''
const ENTITLEMENT = 'lumio_plus'

let instance: Purchases | null = null

export interface LumioPurchaseResult {
  success:           boolean
  entitlementActive: boolean
  error?:            string
}

// Backward-compat alias — usePurchase still imports PurchaseResult
export type PurchaseResult = LumioPurchaseResult

function isActive(customerInfo: CustomerInfo): boolean {
  return ENTITLEMENT in customerInfo.entitlements.active
}

export async function initRevenueCat(userId: string): Promise<void> {
  if (!API_KEY) {
    console.warn('[RevenueCat] VITE_REVENUECAT_API_KEY manquant — ignoré')
    return
  }
  try {
    Purchases.setLogLevel(LogLevel.Silent)
    instance = Purchases.configure(API_KEY, userId)
  } catch (e) {
    console.warn('[RevenueCat] init échoué:', e)
  }
}

export async function getOfferings(): Promise<Offerings | null> {
  if (!instance) return null
  try {
    return await instance.getOfferings()
  } catch {
    return null
  }
}

export async function purchaseLumioPlus(rcPackage: Package): Promise<LumioPurchaseResult> {
  if (!instance) return { success: false, entitlementActive: false, error: 'not_initialized' }
  try {
    const { customerInfo } = await instance.purchase({ rcPackage })
    return { success: true, entitlementActive: isActive(customerInfo) }
  } catch (e: unknown) {
    if (e instanceof Purchases.PurchasesError && e.errorCode === ErrorCode.UserCancelledError) {
      return { success: false, entitlementActive: false, error: 'cancelled' }
    }
    const msg = e instanceof Error ? e.message : 'unknown'
    return { success: false, entitlementActive: false, error: msg }
  }
}

// Web SDK has no native restorePurchases() — re-fetch from RevenueCat servers instead
export async function restorePurchases(): Promise<LumioPurchaseResult> {
  if (!instance) return { success: false, entitlementActive: false, error: 'not_initialized' }
  try {
    const customerInfo    = await instance.getCustomerInfo()
    const entitlementActive = isActive(customerInfo)
    return { success: true, entitlementActive }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    return { success: false, entitlementActive: false, error: msg }
  }
}

export async function checkEntitlement(): Promise<boolean> {
  if (!instance) return false
  try {
    const customerInfo = await instance.getCustomerInfo()
    return isActive(customerInfo)
  } catch {
    return false
  }
}
