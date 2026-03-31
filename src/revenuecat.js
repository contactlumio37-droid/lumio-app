import { Purchases } from "@revenuecat/purchases-js";

const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY;

// Entitlement identifier défini dans le dashboard RevenueCat
export const PAID_ENTITLEMENT = "premium";

let purchases = null;

export async function initRevenueCat(userId) {
  purchases = Purchases.configure(REVENUECAT_API_KEY, userId);
  return purchases;
}

export async function getEntitlements() {
  if (!purchases) return null;
  const { customerInfo } = await purchases.getCustomerInfo();
  return customerInfo.entitlements.active;
}

export async function isPaid() {
  const entitlements = await getEntitlements();
  if (!entitlements) return false;
  return PAID_ENTITLEMENT in entitlements;
}
