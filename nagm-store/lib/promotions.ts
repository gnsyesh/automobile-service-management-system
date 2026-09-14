import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Coupon } from "@/types";
import { coupons as defaultCoupons } from "@/data/coupons";

export interface PromotionItem {
  code: string;
  percentage: number;
  minSubtotal: number;
  description?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface PromotionsConfig {
  gnsyr: PromotionItem;
  eskm: PromotionItem;
  negm10?: PromotionItem;
  welcome15?: PromotionItem;
}

export const DEFAULT_PROMOTIONS: PromotionsConfig = {
  gnsyr: {
    code: "GNSYR",
    percentage: 10,
    minSubtotal: 0,
    description: "10% discount on your entire order",
  },
  eskm: {
    code: "ESKM",
    percentage: 15,
    minSubtotal: 1000,
    description: "15% off for orders over 1000 EGP",
  },
};
DEFAULT_PROMOTIONS.negm10 = DEFAULT_PROMOTIONS.gnsyr;
DEFAULT_PROMOTIONS.welcome15 = DEFAULT_PROMOTIONS.eskm;

/**
 * Validates a discount percentage input.
 * Must be a number between 0 and 100 inclusive.
 */
export function validatePercentage(value: unknown): { valid: boolean; error?: string } {
  if (value === undefined || value === null || value === "") {
    return { valid: false, error: "Percentage value is required." };
  }
  const num = typeof value === "number" ? value : Number(value);
  if (isNaN(num)) {
    return { valid: false, error: "Discount percentage must be a valid number." };
  }
  if (!isFinite(num)) {
    return { valid: false, error: "Discount percentage must be a finite number." };
  }
  if (num < 0) {
    return { valid: false, error: "Discount percentage cannot be negative." };
  }
  if (num > 100) {
    return { valid: false, error: "Discount percentage cannot exceed 100%." };
  }
  return { valid: true };
}

/**
 * Subscribes to real-time promotional discount settings from Firestore.
 * Automatically falls back to DEFAULT_PROMOTIONS on errors or missing documents.
 */
export function subscribePromotions(callback: (config: PromotionsConfig) => void): () => void {
  try {
    const docRef = doc(db, "storeSettings", "discounts");
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          callback(DEFAULT_PROMOTIONS);
          return;
        }

        const data = snapshot.data();
        const rawNegm10 = data?.negm10?.percentage;
        const parsedNegm10 =
          typeof rawNegm10 === "number"
            ? rawNegm10
            : typeof rawNegm10 === "string" && rawNegm10.trim() !== ""
            ? Number(rawNegm10)
            : NaN;
        const negm10Val =
          !isNaN(parsedNegm10) && isFinite(parsedNegm10)
            ? Math.min(100, Math.max(0, parsedNegm10))
            : DEFAULT_PROMOTIONS.gnsyr.percentage;

        const rawWelcome15 = data?.welcome15?.percentage;
        const parsedWelcome15 =
          typeof rawWelcome15 === "number"
            ? rawWelcome15
            : typeof rawWelcome15 === "string" && rawWelcome15.trim() !== ""
            ? Number(rawWelcome15)
            : NaN;
        const welcome15Val =
          !isNaN(parsedWelcome15) && isFinite(parsedWelcome15)
            ? Math.min(100, Math.max(0, parsedWelcome15))
            : DEFAULT_PROMOTIONS.eskm.percentage;

        const config: PromotionsConfig = {
          gnsyr: {
            code: "GNSYR",
            percentage: negm10Val,
            minSubtotal: 0,
            description: `${negm10Val}% discount on your entire order`,
            updatedAt: data?.gnsyr?.updatedAt ?? data?.negm10?.updatedAt,
            updatedBy: data?.gnsyr?.updatedBy ?? data?.negm10?.updatedBy,
          },
          eskm: {
            code: "ESKM",
            percentage: welcome15Val,
            minSubtotal: 1000,
            description: `${welcome15Val}% off for orders over 1000 EGP`,
            updatedAt: data?.eskm?.updatedAt ?? data?.welcome15?.updatedAt,
            updatedBy: data?.eskm?.updatedBy ?? data?.welcome15?.updatedBy,
          },
        };
        config.negm10 = config.gnsyr;
        config.welcome15 = config.eskm;

        callback(config);
      },
      (error) => {
        console.warn("Could not subscribe to storeSettings/discounts, using defaults:", error);
        callback(DEFAULT_PROMOTIONS);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn("Failed to initialize promotions subscription:", err);
    callback(DEFAULT_PROMOTIONS);
    return () => {};
  }
}

/**
 * Saves promotional discounts to Firestore storeSettings/discounts.
 */
export async function savePromotions(
  config: {
    negm10Percentage?: number;
    welcome15Percentage?: number;
    gnsyrPercentage?: number;
    eskmPercentage?: number;
  },
  adminUid: string
): Promise<void> {
  const gnsyrVal = config.gnsyrPercentage ?? config.negm10Percentage ?? 10;
  const eskmVal = config.eskmPercentage ?? config.welcome15Percentage ?? 15;

  const v1 = validatePercentage(gnsyrVal);
  if (!v1.valid) throw new Error(v1.error);

  const v2 = validatePercentage(eskmVal);
  if (!v2.valid) throw new Error(v2.error);

  // Guarantee Firebase ID token is fresh and synchronized with Firestore request headers
  if (auth.currentUser) {
    try {
      await auth.currentUser.getIdToken(true);
    } catch (tokenErr) {
      console.warn("Could not force refresh token before saving promotions:", tokenErr);
    }
  }

  const effectiveUid = auth.currentUser?.uid || adminUid;
  const now = new Date().toISOString();

  const docRef = doc(db, "storeSettings", "discounts");
  await setDoc(
    docRef,
    {
      negm10: {
        code: "GNSYR",
        percentage: Number(gnsyrVal),
        minSubtotal: 0,
        updatedAt: now,
        updatedBy: effectiveUid,
      },
      welcome15: {
        code: "ESKM",
        percentage: Number(eskmVal),
        minSubtotal: 1000,
        updatedAt: now,
        updatedBy: effectiveUid,
      },
      updatedAt: now,
      updatedBy: effectiveUid,
    },
    { merge: true }
  );
}

/**
 * Returns dynamic coupon definitions merged with the latest promotions settings.
 */
export function getCouponsWithPromotions(config: PromotionsConfig): Coupon[] {
  const gnsyrConfig = config.gnsyr || config.negm10;
  const eskmConfig = config.eskm || config.welcome15;

  return defaultCoupons.map((coupon) => {
    if (coupon.code === "GNSYR") {
      return {
        ...coupon,
        value: gnsyrConfig.percentage,
        description: `${gnsyrConfig.percentage}% discount on your entire order`,
      };
    }
    if (coupon.code === "ESKM") {
      return {
        ...coupon,
        value: eskmConfig.percentage,
        minSubtotal: 1000,
        description: `${eskmConfig.percentage}% off for orders over 1000 EGP`,
        newCustomerOnly: true,
      };
    }
    return coupon;
  });
}
