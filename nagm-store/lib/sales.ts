import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  increment,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order, OrderStatus, ProductSales, ProcessedSalesOrder } from "@/types";

/**
 * Validates whether an order qualifies for sales calculation.
 * Follows canonical revenue rules:
 * - Excludes Cancelled orders
 * - Excludes orders with total <= 0
 */
export function isQualifyingSalesOrder(order: Order): boolean {
  if (!order) return false;
  const s = (order.status || order.orderStatus || "").toLowerCase();
  if (s === "cancelled") return false;
  return (order.total || 0) > 0;
}

/**
 * Records sales aggregation for an order in `productSales/{productId}`.
 * Includes an idempotency guard using `processedSalesOrders/{orderId}` to prevent
 * duplicate sales counting on retries, page refreshes, or repeated executions.
 */
export async function recordOrderSales(order: Order): Promise<boolean> {
  if (!order || !order.id) return false;
  if (!isQualifyingSalesOrder(order)) return false;
  if (!Array.isArray(order.items) || order.items.length === 0) return false;

  try {
    const processedRef = doc(db, "processedSalesOrders", order.id);
    const processedSnap = await getDoc(processedRef);

    // Idempotency check: do not count the same order twice
    if (processedSnap.exists()) {
      return false;
    }

    // Aggregate quantities and revenue per unique product ID in this order
    const summary = new Map<string, { quantity: number; price: number; revenue: number }>();
    const processedItems: { productId: string; quantity: number; price: number }[] = [];

    for (const item of order.items) {
      const prod = item.product;
      if (!prod || !prod.id) continue;
      const pid = prod.id;
      const qty = Number(item.quantity) || 1;
      const price = Number(prod.price) || 0;
      const revenue = qty * price;

      processedItems.push({ productId: pid, quantity: qty, price });

      const existing = summary.get(pid) || { quantity: 0, price, revenue: 0 };
      existing.quantity += qty;
      existing.revenue += revenue;
      summary.set(pid, existing);
    }

    if (summary.size === 0) return false;

    const batch = writeBatch(db);

    // 1. Mark order as processed for sales aggregation
    batch.set(processedRef, {
      orderId: order.id,
      processedAt: new Date().toISOString(),
      status: order.status || order.orderStatus || "Processing",
      cancelled: false,
      items: processedItems,
    } as ProcessedSalesOrder);

    // 2. Increment unitsSold and revenue on productSales/{productId}
    const nowIso = new Date().toISOString();
    for (const [pid, data] of summary.entries()) {
      const saleRef = doc(db, "productSales", pid);
      batch.set(
        saleRef,
        {
          productId: pid,
          unitsSold: increment(data.quantity),
          revenue: increment(data.revenue),
          updatedAt: nowIso,
        },
        { merge: true }
      );
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error(`Error recording sales for order ${order.id}:`, error);
    return false;
  }
}

/**
 * Handles status transitions (e.g. to/from "Cancelled").
 * If an order is cancelled, decrements `productSales` and marks `processedSalesOrders`.
 * If an order is un-cancelled, re-applies the sales count.
 */
export async function adjustSalesOnOrderCancellation(
  order: Order,
  previousStatus: OrderStatus,
  newStatus: OrderStatus
): Promise<boolean> {
  if (!order || !order.id) return false;

  const prevIsCancelled = previousStatus.toLowerCase() === "cancelled";
  const newIsCancelled = newStatus.toLowerCase() === "cancelled";

  if (prevIsCancelled === newIsCancelled) return false;

  try {
    const processedRef = doc(db, "processedSalesOrders", order.id);
    const processedSnap = await getDoc(processedRef);

    // Case 1: Order is newly cancelled -> decrement sales
    if (!prevIsCancelled && newIsCancelled) {
      const nowIso = new Date().toISOString();
      const batch = writeBatch(db);

      if (processedSnap.exists()) {
        const data = processedSnap.data() as ProcessedSalesOrder;
        if (data.cancelled) return false;

        batch.update(processedRef, {
          cancelled: true,
          cancelledAt: nowIso,
          status: newStatus,
        });

        // Decrement unitsSold and revenue for each product
        for (const item of data.items || []) {
          if (!item.productId) continue;
          const saleRef = doc(db, "productSales", item.productId);
          batch.set(
            saleRef,
            {
              productId: item.productId,
              unitsSold: increment(-item.quantity),
              revenue: increment(-(item.quantity * item.price)),
              updatedAt: nowIso,
            },
            { merge: true }
          );
        }
      } else {
        // Resilience fix for older orders: use order.items directly
        if (!Array.isArray(order.items) || order.items.length === 0) return false;

        const processedItems: { productId: string; quantity: number; price: number }[] = [];
        const summary = new Map<string, { quantity: number; price: number }>();

        for (const it of order.items) {
          const prod = it.product;
          if (!prod || !prod.id) continue;
          const pid = prod.id;
          const qty = Number(it.quantity) || 1;
          const price = Number(prod.price) || 0;

          processedItems.push({ productId: pid, quantity: qty, price });
          const cur = summary.get(pid) || { quantity: 0, price };
          cur.quantity += qty;
          summary.set(pid, cur);
        }

        if (summary.size === 0) return false;

        batch.set(processedRef, {
          orderId: order.id,
          processedAt: nowIso,
          status: newStatus,
          cancelled: true,
          cancelledAt: nowIso,
          items: processedItems,
        } as ProcessedSalesOrder);

        for (const [pid, data] of summary.entries()) {
          const saleRef = doc(db, "productSales", pid);
          batch.set(
            saleRef,
            {
              productId: pid,
              unitsSold: increment(-data.quantity),
              revenue: increment(-(data.quantity * data.price)),
              updatedAt: nowIso,
            },
            { merge: true }
          );
        }
      }

      await batch.commit();
      return true;
    }

    // Case 2: Order was cancelled and is now restored (e.g. to Processing or Shipped)
    if (prevIsCancelled && !newIsCancelled) {
      if (processedSnap.exists()) {
        const data = processedSnap.data() as ProcessedSalesOrder;
        if (!data.cancelled) return false;

        const batch = writeBatch(db);
        const nowIso = new Date().toISOString();

        batch.update(processedRef, {
          cancelled: false,
          status: newStatus,
        });

        for (const item of data.items || []) {
          if (!item.productId) continue;
          const saleRef = doc(db, "productSales", item.productId);
          batch.set(
            saleRef,
            {
              productId: item.productId,
              unitsSold: increment(item.quantity),
              revenue: increment(item.quantity * item.price),
              updatedAt: nowIso,
            },
            { merge: true }
          );
        }

        await batch.commit();
        return true;
      } else {
        // Was never recorded, record fresh
        return await recordOrderSales(order);
      }
    }

    return false;
  } catch (error) {
    console.error(`Error adjusting sales on cancellation for order ${order.id}:`, error);
    return false;
  }
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

/**
 * Admin utility to reconcile/initialize `productSales` from all historical qualifying orders.
 * Safe and idempotent.
 */
export async function syncProductSalesFromOrders(orders: Order[]): Promise<{ syncedCount: number }> {
  if (!Array.isArray(orders) || orders.length === 0) return { syncedCount: 0 };

  try {
    const productStats = new Map<string, { unitsSold: number; revenue: number }>();
    const qualifyingOrders: Order[] = [];

    for (const order of orders) {
      if (!isQualifyingSalesOrder(order)) continue;
      if (!Array.isArray(order.items)) continue;

      qualifyingOrders.push(order);

      for (const item of order.items) {
        const prod = item.product;
        if (!prod || !prod.id) continue;
        const pid = prod.id;
        const qty = Number(item.quantity) || 1;
        const price = Number(prod.price) || 0;

        const current = productStats.get(pid) || { unitsSold: 0, revenue: 0 };
        current.unitsSold += qty;
        current.revenue += qty * price;
        productStats.set(pid, current);
      }
    }

    const nowIso = new Date().toISOString();
    const batch = writeBatch(db);

    for (const [pid, stats] of productStats.entries()) {
      const saleRef = doc(db, "productSales", pid);
      batch.set(
        saleRef,
        {
          productId: pid,
          unitsSold: Math.max(0, stats.unitsSold),
          revenue: Math.max(0, stats.revenue),
          updatedAt: nowIso,
        },
        { merge: true }
      );
    }

    // Mark qualifying orders in processedSalesOrders
    for (const ord of qualifyingOrders) {
      const processedRef = doc(db, "processedSalesOrders", ord.id);
      const items = (ord.items || []).map((it) => ({
        productId: it.product?.id || "unknown",
        quantity: it.quantity || 1,
        price: it.product?.price || 0,
      }));
      batch.set(
        processedRef,
        {
          orderId: ord.id,
          processedAt: nowIso,
          status: ord.status || ord.orderStatus || "Processing",
          cancelled: false,
          items,
        },
        { merge: true }
      );
    }

    await batch.commit();
    return { syncedCount: productStats.size };
  } catch (error) {
    console.error("Error syncing product sales from orders:", error);
    return { syncedCount: 0 };
  }
}
