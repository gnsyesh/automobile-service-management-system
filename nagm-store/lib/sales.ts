import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order, ProductSales } from "@/types";

/**
 * Validates whether an order qualifies for sales calculation.
 * Follows canonical revenue rules:
 * - Excludes Cancelled orders
 * - Excludes orders with total <= 0
 */
export function isQualifyingSalesOrder(order: Order): boolean {
  if (!order) return false;

  const orderStatus = (order.status || order.orderStatus || "").toLowerCase();

  if (orderStatus === "cancelled") return false;
  if ((order.total || 0) <= 0) return false;

  // COD orders are considered sales when the order is placed.
  if (order.paymentMethod === "cod") return true;

  // Card orders count only after successful payment confirmation.
  if (order.paymentMethod === "card") {
    return order.paymentStatus === "paid";
  }

  return false;
}

/**
 * Fetches the top-selling product sales from `productSales` collection.
 * Lightweight: reads only the top N documents ordered by `unitsSold desc`.
 * Fails gracefully and returns an empty array if offline or uninitialized.
 */
export async function fetchTopSellingSales(limitCount = 10): Promise<ProductSales[]> {
  try {
    const q = query(
      collection(db, "productSales"),
      orderBy("unitsSold", "desc"),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    const results: ProductSales[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const unitsSold = Number(data.unitsSold) || 0;
      if (unitsSold > 0) {
        results.push({
          productId: docSnap.id,
          unitsSold,
          revenue: Number(data.revenue) || 0,
          updatedAt: data.updatedAt || "",
        });
      }
    });

    return results;
  } catch (error) {
    console.warn("Could not fetch top selling sales from Firestore (fallback will be used):", error);
    return [];
  }
}
