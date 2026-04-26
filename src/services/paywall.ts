import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { Platform } from 'react-native';

const IOS_KEY = process.env.REVENUECAT_API_KEY_IOS ?? process.env.REVENUECAT_API_KEY ?? '';
const ANDROID_KEY = process.env.REVENUECAT_API_KEY_ANDROID ?? process.env.REVENUECAT_API_KEY ?? '';

let configured = false;

export function configureRevenueCat(): void {
  if (configured) return;
  const apiKey = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;
  if (!apiKey) return;
  Purchases.configure({ apiKey });
  configured = true;
}

export async function getOfferings(): Promise<PurchasesPackage[]> {
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) return [];
    return current.availablePackages;
  } catch {
    return [];
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<{
  success: boolean;
  isPremium: boolean;
  error?: string;
}> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPremium = isCustomerPremium(customerInfo);
    return { success: true, isPremium };
  } catch (err: any) {
    if (err?.userCancelled) return { success: false, isPremium: false };
    return { success: false, isPremium: false, error: err?.message ?? 'Purchase failed' };
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return isCustomerPremium(customerInfo);
  } catch {
    return false;
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

function isCustomerPremium(info: CustomerInfo): boolean {
  return Object.keys(info.entitlements.active).length > 0;
}
