import { FieldValue, adminDb } from "@/lib/firebase-admin";
import type { Order, OrderStatus, ProcessedSalesOrder } from "@/types";

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

  // Card orders count only after successful payment confirmation
  if (order.paymentMethod === "card") {
    return order.paymentStatus === "paid";
  }

  return false;
}

/**
 * Records sales aggregation server-side in `productSales/{productId}` using
 * Firestore transaction semantics for guaranteed idempotency and concurrency safety.
 */
export async function recordOrderSalesServer(order: Order): Promise<boolean> {
  if (!order || !order.id) return false;
  if (!isQualifyingSalesOrder(order)) return false;
  if (!Array.isArray(order.items) || order.items.length === 0) return false;

  try {
    return await adminDb.runTransaction(async (transaction) => {
      const processedRef = adminDb.collection("processedSalesOrders").doc(order.id);
      const processedSnap = await transaction.get(processedRef);

      // Transactional Idempotency check: if already recorded, exit immediately
      if (processedSnap.exists) {
        return false;
      }

      // Aggregate quantities and revenue per unique product ID (preserving duplicate product-ID handling)
      const summary = new Map<string, { quantity: number; price: number; revenue: number }>();
      const processedItems: { productId: string; quantity: number; price: number }[] = [];

      for (const item of order.items) {
        const prod = item.product;
        if (!prod || !prod.id) continue;
        const pid = prod.id;
        const qty = Number(item.quantity) || 1;
        // Priority 2: Use persisted purchase price (item.price) if present, fallback to catalog price
        const price = Number((item as any).price ?? prod.price) || 0;
        const revenue = qty * price;

        processedItems.push({ productId: pid, quantity: qty, price });

        const existing = summary.get(pid) || { quantity: 0, price, revenue: 0 };
        existing.quantity += qty;
        existing.revenue += revenue;
        summary.set(pid, existing);
      }

      if (summary.size === 0) return false;

      const nowIso = new Date().toISOString();

      // 1. Mark order in processedSalesOrders inside the same transaction
      transaction.set(processedRef, {
        orderId: order.id,
        processedAt: nowIso,
        status: order.status || order.orderStatus || "Processing",
        cancelled: false,
        items: processedItems,
      } as ProcessedSalesOrder);

      // 2. Atomically increment unitsSold and revenue on productSales/{productId}
      for (const [pid, data] of summary.entries()) {
        const saleRef = adminDb.collection("productSales").doc(pid);
        transaction.set(
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

      return true;
    });
  } catch (error) {
    console.error(`Error recording sales server-side for order ${order.id}:`, error);
    return false;
  }
}

/**
 * Handles status transitions server-side (e.g. to/from "Cancelled") using
 * Firestore transaction semantics for guaranteed idempotency and concurrency safety.
 */
export async function adjustSalesOnOrderCancellationServer(
  order: Order,
  previousStatus: OrderStatus,
  newStatus: OrderStatus
): Promise<boolean> {
  if (!order || !order.id) return false;

  const prevIsCancelled = (previousStatus || "").toLowerCase() === "cancelled";
  const newIsCancelled = (newStatus || "").toLowerCase() === "cancelled";

  if (prevIsCancelled === newIsCancelled) return false;

  // Authoritative condition: On ACTIVE -> CANCELLED, if sales were not recorded for this order,
  // do NOT modify productSales and do NOT create a processedSalesOrders record.
  if (!prevIsCancelled && newIsCancelled && order.salesRecorded !== true) {
    return false;
  }

  // On CANCELLED -> ACTIVE, only qualifying sales orders can record sales
  if (prevIsCancelled && !newIsCancelled && !isQualifyingSalesOrder(order)) {
    return false;
  }

  try {
    return await adminDb.runTransaction(async (transaction) => {
      const processedRef = adminDb.collection("processedSalesOrders").doc(order.id);
      const processedSnap = await transaction.get(processedRef);
      const nowIso = new Date().toISOString();

      // Case 1: Order newly cancelled -> reverse recorded sales
      if (!prevIsCancelled && newIsCancelled) {
        // Authoritative guard: only orders with salesRecorded === true can reverse sales
        if (order.salesRecorded !== true) {
          return false;
        }

        if (processedSnap.exists) {
          const data = processedSnap.data() as ProcessedSalesOrder;
          // Transactional guard: already cancelled, do not decrement twice
          if (data.cancelled) return false;

          transaction.update(processedRef, {
            cancelled: true,
            cancelledAt: nowIso,
            status: newStatus,
          });

          // Aggregate quantities & revenue per unique productId from processed items
          const summary = new Map<string, { quantity: number; revenue: number }>();
          const itemsList = Array.isArray(data.items) && data.items.length > 0 ? data.items : [];

          for (const item of itemsList) {
            if (!item.productId) continue;
            const existing = summary.get(item.productId) || { quantity: 0, revenue: 0 };
            existing.quantity += item.quantity;
            existing.revenue += item.quantity * item.price;
            summary.set(item.productId, existing);
          }

          for (const [pid, agg] of summary.entries()) {
            const saleRef = adminDb.collection("productSales").doc(pid);
            transaction.set(
              saleRef,
              {
                productId: pid,
                unitsSold: FieldValue.increment(-agg.quantity),
                revenue: FieldValue.increment(-agg.revenue),
                updatedAt: nowIso,
              },
              { merge: true }
            );
          }
          return true;
        } else {
          // If salesRecorded === true was set on order, but processedSalesOrders doc is somehow missing,
          // reverse based on order.items with proper aggregation and create the processedSalesOrders doc
          if (!Array.isArray(order.items) || order.items.length === 0) return false;

          const summary = new Map<string, { quantity: number; price: number; revenue: number }>();
          const processedItems: { productId: string; quantity: number; price: number }[] = [];

          for (const it of order.items) {
            const prod = it.product;
            if (!prod || !prod.id) continue;
            const pid = prod.id;
            const qty = Number(it.quantity) || 1;
            const price = Number((it as any).price ?? prod.price) || 0;
            const revenue = qty * price;

            processedItems.push({ productId: pid, quantity: qty, price });
            const existing = summary.get(pid) || { quantity: 0, price, revenue: 0 };
            existing.quantity += qty;
            existing.revenue += revenue;
            summary.set(pid, existing);
          }

          if (summary.size === 0) return false;

          transaction.set(processedRef, {
            orderId: order.id,
            processedAt: nowIso,
            status: newStatus,
            cancelled: true,
            cancelledAt: nowIso,
            items: processedItems,
          } as ProcessedSalesOrder);

          for (const [pid, data] of summary.entries()) {
            const saleRef = adminDb.collection("productSales").doc(pid);
            transaction.set(
              saleRef,
              {
                productId: pid,
                unitsSold: FieldValue.increment(-data.quantity),
                revenue: FieldValue.increment(-data.revenue),
                updatedAt: nowIso,
              },
              { merge: true }
            );
          }
          return true;
        }
      }

      // Case 2: Order restored from cancelled -> re-apply sales
      if (prevIsCancelled && !newIsCancelled) {
        if (!isQualifyingSalesOrder(order)) return false;

        if (processedSnap.exists) {
          const data = processedSnap.data() as ProcessedSalesOrder;
          // Transactional guard: already active (not cancelled), do not double-count
          if (!data.cancelled) return false;

          transaction.update(processedRef, {
            cancelled: false,
            status: newStatus,
          });

          // Aggregate duplicate product IDs
          const summary = new Map<string, { quantity: number; revenue: number }>();
          const itemsList = Array.isArray(data.items) && data.items.length > 0 ? data.items : [];

          for (const item of itemsList) {
            if (!item.productId) continue;
            const existing = summary.get(item.productId) || { quantity: 0, revenue: 0 };
            existing.quantity += item.quantity;
            existing.revenue += item.quantity * item.price;
            summary.set(item.productId, existing);
          }

          for (const [pid, agg] of summary.entries()) {
            const saleRef = adminDb.collection("productSales").doc(pid);
            transaction.set(
              saleRef,
              {
                productId: pid,
                unitsSold: FieldValue.increment(agg.quantity),
                revenue: FieldValue.increment(agg.revenue),
                updatedAt: nowIso,
              },
              { merge: true }
            );
          }
          return true;
        } else {
          // Fresh registration if not in processedSalesOrders
          if (!Array.isArray(order.items) || order.items.length === 0) return false;

          const summary = new Map<string, { quantity: number; price: number; revenue: number }>();
          const processedItems: { productId: string; quantity: number; price: number }[] = [];

          for (const item of order.items) {
            const prod = item.product;
            if (!prod || !prod.id) continue;
            const pid = prod.id;
            const qty = Number(item.quantity) || 1;
            const price = Number((item as any).price ?? prod.price) || 0;
            const revenue = qty * price;

            processedItems.push({ productId: pid, quantity: qty, price });

            const existing = summary.get(pid) || { quantity: 0, price, revenue: 0 };
            existing.quantity += qty;
            existing.revenue += revenue;
            summary.set(pid, existing);
          }

          if (summary.size === 0) return false;

          transaction.set(processedRef, {
            orderId: order.id,
            processedAt: nowIso,
            status: newStatus,
            cancelled: false,
            items: processedItems,
          } as ProcessedSalesOrder);

          for (const [pid, data] of summary.entries()) {
            const saleRef = adminDb.collection("productSales").doc(pid);
            transaction.set(
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
          return true;
        }
      }

      return false;
    });
  } catch (error) {
    console.error(`Error adjusting sales on cancellation for order ${order.id}:`, error);
    return false;
  }
}
