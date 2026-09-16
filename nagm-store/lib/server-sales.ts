import { FieldValue, adminDb } from "@/lib/firebase-admin";
import { Order, OrderStatus, ProcessedSalesOrder } from "@/types";

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

  // COD orders count when confirmed placed
  if (order.paymentMethod === "cod") return true;

  // Card/wallet orders count only after successful payment confirmation
  if (order.paymentMethod === "card" || order.paymentMethod === "wallet") {
    return order.paymentStatus === "paid";
  }

  return false;
}

/**
 * Records sales aggregation server-side in `productSales/{productId}`.
 * Includes an idempotency guard using `processedSalesOrders/{orderId}` to prevent
 * duplicate sales counting.
 */
export async function recordOrderSalesServer(order: Order): Promise<boolean> {
  if (!order || !order.id) return false;
  if (!isQualifyingSalesOrder(order)) return false;
  if (!Array.isArray(order.items) || order.items.length === 0) return false;

  try {
    const processedRef = adminDb.collection("processedSalesOrders").doc(order.id);
    const processedSnap = await processedRef.get();

    // Idempotency check
    if (processedSnap.exists) {
      return false;
    }

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

    const batch = adminDb.batch();

    // 1. Mark order in processedSalesOrders
    const nowIso = new Date().toISOString();
    batch.set(processedRef, {
      orderId: order.id,
      processedAt: nowIso,
      status: order.status || order.orderStatus || "Processing",
      cancelled: false,
      items: processedItems,
    } as ProcessedSalesOrder);

    // 2. Increment unitsSold and revenue on productSales/{productId}
    for (const [pid, data] of summary.entries()) {
      const saleRef = adminDb.collection("productSales").doc(pid);
      batch.set(
        saleRef,
        {
          productId: pid,
          unitsSold: FieldValue.increment(data.quantity),
          revenue: FieldValue.increment(data.revenue),
          updatedAt: nowIso,
        },
        { merge: true }
      );
    }

    await batch.commit();
    return true;
  } catch (error) {
    console.error(`Error recording sales server-side for order ${order.id}:`, error);
    return false;
  }
}

/**
 * Handles status transitions server-side (e.g. to/from "Cancelled").
 */
export async function adjustSalesOnOrderCancellationServer(
  order: Order,
  previousStatus: OrderStatus,
  newStatus: OrderStatus
): Promise<boolean> {
  if (!order || !order.id) return false;

  const prevIsCancelled = previousStatus.toLowerCase() === "cancelled";
  const newIsCancelled = newStatus.toLowerCase() === "cancelled";

  if (prevIsCancelled === newIsCancelled) return false;

  try {
    const processedRef = adminDb.collection("processedSalesOrders").doc(order.id);
    const processedSnap = await processedRef.get();
    const nowIso = new Date().toISOString();

    // Case 1: Order newly cancelled -> decrement sales
    if (!prevIsCancelled && newIsCancelled) {
      const batch = adminDb.batch();

      if (processedSnap.exists) {
        const data = processedSnap.data() as ProcessedSalesOrder;
        if (data.cancelled) return false;

        batch.update(processedRef, {
          cancelled: true,
          cancelledAt: nowIso,
          status: newStatus,
        });

        for (const item of data.items || []) {
          if (!item.productId) continue;
          const saleRef = adminDb.collection("productSales").doc(item.productId);
          batch.set(
            saleRef,
            {
              productId: item.productId,
              unitsSold: FieldValue.increment(-item.quantity),
              revenue: FieldValue.increment(-(item.quantity * item.price)),
              updatedAt: nowIso,
            },
            { merge: true }
          );
        }
      } else {
        // Older order fallback
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
          const saleRef = adminDb.collection("productSales").doc(pid);
          batch.set(
            saleRef,
            {
              productId: pid,
              unitsSold: FieldValue.increment(-data.quantity),
              revenue: FieldValue.increment(-(data.quantity * data.price)),
              updatedAt: nowIso,
            },
            { merge: true }
          );
        }
      }

      await batch.commit();
      return true;
    }

    // Case 2: Order restored from cancelled
    if (prevIsCancelled && !newIsCancelled) {
      if (processedSnap.exists) {
        const data = processedSnap.data() as ProcessedSalesOrder;
        if (!data.cancelled) return false;

        const batch = adminDb.batch();

        batch.update(processedRef, {
          cancelled: false,
          status: newStatus,
        });

        for (const item of data.items || []) {
          if (!item.productId) continue;
          const saleRef = adminDb.collection("productSales").doc(item.productId);
          batch.set(
            saleRef,
            {
              productId: item.productId,
              unitsSold: FieldValue.increment(item.quantity),
              revenue: FieldValue.increment(item.quantity * item.price),
              updatedAt: nowIso,
            },
            { merge: true }
          );
        }

        await batch.commit();
        return true;
      } else {
        return await recordOrderSalesServer(order);
      }
    }

    return false;
  } catch (error) {
    console.error(`Error adjusting sales on cancellation for order ${order.id}:`, error);
    return false;
  }
}
