import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdminToken } from "@/lib/server-auth";
import { adjustSalesOnOrderCancellationServer } from "@/lib/server-sales";

const VALID_STATUSES = new Set([
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
]);

const ACTIVE_STATUSES = new Set([
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
]);

export async function PATCH(request: Request) {
  try {
    // Only an active admin can change order status.
    await verifyAdminToken(request);

    const body = await request.json();

    const orderId =
      typeof body?.orderId === "string" ? body.orderId.trim() : "";

    const newStatus =
      typeof body?.newStatus === "string" ? body.newStatus.trim() : "";

    if (!orderId || !newStatus) {
      return NextResponse.json(
        {
          error: "Order ID and new status are required.",
          code: "INVALID_REQUEST",
        },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.has(newStatus)) {
      return NextResponse.json(
        {
          error: "Invalid order status.",
          code: "INVALID_STATUS",
        },
        { status: 400 }
      );
    }

    const orderRef = adminDb.collection("orders").doc(orderId);
    let cachedOrderData: any = null;

    const result = await adminDb.runTransaction(async (transaction) => {
      const orderSnap = await transaction.get(orderRef);

      if (!orderSnap.exists) {
        throw new Error("ORDER_NOT_FOUND");
      }

      const orderData = orderSnap.data() as any;
      cachedOrderData = orderData;

      const previousStatus =
        orderData.status ||
        orderData.orderStatus ||
        "Processing";

      if (!VALID_STATUSES.has(previousStatus)) {
        throw new Error("INVALID_EXISTING_STATUS");
      }

      // Nothing to do if the status has not actually changed.
      if (previousStatus === newStatus) {
        return {
          changed: false,
          previousStatus,
          newStatus,
          stockChanged: false,
        };
      }

      // Delivered orders cannot be cancelled directly without return workflow
      if (previousStatus === "Delivered" && newStatus === "Cancelled") {
        throw new Error("DELIVERED_ORDER_CANNOT_BE_CANCELLED");
      }

      // Delivered orders have completed fulfillment and cannot revert status
      if (previousStatus === "Delivered" && newStatus !== "Delivered") {
        throw new Error("DELIVERED_ORDER_CANNOT_CHANGE_STATUS");
      }

      // Cancelled orders cannot jump directly to Delivered
      if (previousStatus === "Cancelled" && newStatus === "Delivered") {
        throw new Error("CANCELLED_ORDER_CANNOT_BE_DIRECTLY_DELIVERED");
      }

      const paymentMethod = orderData.paymentMethod || "cod";
      const paymentStatus = orderData.paymentStatus || "pending";

      // Unpaid Card orders cannot transition to Processing, Shipped, or Delivered
      if (
        paymentMethod === "card" &&
        paymentStatus !== "paid" &&
        (newStatus === "Processing" || newStatus === "Shipped" || newStatus === "Delivered")
      ) {
        throw new Error("UNPAID_CARD_ORDER_CANNOT_BE_PROCESSED");
      }

      const wasCancelled = previousStatus === "Cancelled";
      const isCancelled = newStatus === "Cancelled";

      // ---------------------------------------------------------
      // Validate the order items and aggregate duplicate products.
      // ---------------------------------------------------------
      const quantities = new Map<string, number>();

      if (!Array.isArray(orderData.items)) {
        throw new Error("ORDER_HAS_NO_VALID_ITEMS");
      }

      for (const item of orderData.items) {
        const productId =
          typeof item?.product?.id === "string"
            ? item.product.id.trim()
            : typeof item?.productId === "string"
            ? item.productId.trim()
            : "";

        const quantity = Number(item?.quantity);

        if (!productId) {
          throw new Error("INVALID_ORDER_ITEM");
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
          throw new Error("INVALID_ORDER_QUANTITY");
        }

        quantities.set(
          productId,
          (quantities.get(productId) || 0) + quantity
        );
      }

      if (quantities.size === 0) {
        throw new Error("ORDER_HAS_NO_VALID_ITEMS");
      }

      // =========================================================
      // ACTIVE -> CANCELLED
      //
      // Restore inventory only if this order currently has
      // inventory deducted.
      // =========================================================
      if (!wasCancelled && isCancelled) {
        if (orderData.stockDecremented === true) {
          const productSnapshots: Array<{
            productId: string;
            quantity: number;
            ref: any;
            snap: any;
          }> = [];

          // Read all products first.
          for (const [productId, quantity] of quantities.entries()) {
            const productRef = adminDb
              .collection("products")
              .doc(productId);

            const productSnap = await transaction.get(productRef);

            if (!productSnap.exists) {
              throw new Error(`PRODUCT_NOT_FOUND:${productId}`);
            }

            productSnapshots.push({
              productId,
              quantity,
              ref: productRef,
              snap: productSnap,
            });
          }

          // Restore current Firestore stock.
          for (const product of productSnapshots) {
            const productData = product.snap.data() as any;
            const currentStock = Number(productData?.stockCount);

            if (
              !Number.isInteger(currentStock) ||
              currentStock < 0
            ) {
              throw new Error(
                `INVALID_PRODUCT_STOCK:${product.productId}`
              );
            }

            const restoredStock =
              currentStock + product.quantity;

            transaction.update(product.ref, {
              stockCount: restoredStock,
              inStock: restoredStock > 0,
              updatedAt: new Date().toISOString(),
            });
          }

          transaction.update(orderRef, {
            stockDecremented: false,
          });
        }
      }

      // =========================================================
      // CANCELLED -> ACTIVE
      //
      // COD:
      //   inventory should be deducted again.
      //
      // CARD:
      //   inventory should only be deducted if payment succeeded.
      //
      // Failed/pending Card orders cannot consume inventory merely
      // because an admin changes their status.
      // =========================================================
      if (wasCancelled && !isCancelled) {
        const paymentMethod = orderData.paymentMethod;
        const paymentStatus = orderData.paymentStatus;

        // Do not allow unpaid/failed Card orders to become active.
        if (
          paymentMethod === "card" &&
          paymentStatus !== "paid"
        ) {
          throw new Error("CARD_PAYMENT_NOT_COMPLETED");
        }

        const shouldDeductStock =
          paymentMethod === "cod" ||
          (paymentMethod === "card" && paymentStatus === "paid");

        if (shouldDeductStock && orderData.stockDecremented !== true) {
          const productSnapshots: Array<{
            productId: string;
            quantity: number;
            ref: any;
            snap: any;
          }> = [];

          // Read every product first.
          for (const [productId, quantity] of quantities.entries()) {
            const productRef = adminDb
              .collection("products")
              .doc(productId);

            const productSnap = await transaction.get(productRef);

            if (!productSnap.exists) {
              throw new Error(`PRODUCT_NOT_FOUND:${productId}`);
            }

            productSnapshots.push({
              productId,
              quantity,
              ref: productRef,
              snap: productSnap,
            });
          }

          // Validate ALL stock before changing ANY stock.
          for (const product of productSnapshots) {
            const productData = product.snap.data() as any;
            const currentStock = Number(productData?.stockCount);

            if (
              !Number.isInteger(currentStock) ||
              currentStock < 0
            ) {
              throw new Error(
                `INVALID_PRODUCT_STOCK:${product.productId}`
              );
            }

            if (currentStock < product.quantity) {
              throw new Error(
                `INSUFFICIENT_STOCK:${product.productId}:${currentStock}:${product.quantity}`
              );
            }
          }

          // Deduct all products atomically.
          for (const product of productSnapshots) {
            const productData = product.snap.data() as any;
            const currentStock = Number(productData.stockCount);

            const resultingStock =
              currentStock - product.quantity;

            transaction.update(product.ref, {
              stockCount: resultingStock,
              inStock: resultingStock > 0,
              updatedAt: new Date().toISOString(),
            });
          }

          transaction.update(orderRef, {
            stockDecremented: true,
          });
        }
      }

      // =========================================================
      // ACTIVE -> ACTIVE
      //
      // Pending -> Processing
      // Processing -> Shipped
      // Shipped -> Delivered
      //
      // No inventory change.
      // =========================================================
      if (
        ACTIVE_STATUSES.has(previousStatus) &&
        ACTIVE_STATUSES.has(newStatus)
      ) {
        // Intentionally no stock operation.
      }

      // ---------------------------------------------------------
      // Update the order status itself.
      // ---------------------------------------------------------
      const nowIso = new Date().toISOString();

      transaction.update(orderRef, {
        status: newStatus,
        orderStatus: newStatus,
        updatedAt: nowIso,
      });

      return {
        changed: true,
        previousStatus,
        newStatus,
        stockChanged:
          previousStatus === "Cancelled" ||
          newStatus === "Cancelled",
      };
    });

    // Handle sales record adjustment server-side after transaction commits
    let salesAdjusted = false;
    let salesWarning: string | undefined = undefined;

    if (
      result.changed &&
      cachedOrderData &&
      ((result.previousStatus === "Cancelled" && result.newStatus !== "Cancelled") ||
        (result.previousStatus !== "Cancelled" && result.newStatus === "Cancelled"))
    ) {
      const isCancellation = result.newStatus === "Cancelled";
      const hadSalesRecorded = cachedOrderData.salesRecorded === true;

      // On cancellation: only adjust if sales were actually recorded
      // On reactivation: only adjust if order qualifies for sales
      const shouldAdjust = isCancellation
        ? hadSalesRecorded
        : (cachedOrderData.paymentMethod === "cod" || (cachedOrderData.paymentMethod === "card" && cachedOrderData.paymentStatus === "paid"));

      if (shouldAdjust) {
        try {
          const adjusted = await adjustSalesOnOrderCancellationServer(
            { id: orderId, ...cachedOrderData },
            result.previousStatus as any,
            result.newStatus as any
          );
          if (adjusted) {
            salesAdjusted = true;
            await adminDb.collection("orders").doc(orderId).update({
              salesRecorded: !isCancellation,
              updatedAt: new Date().toISOString(),
            });
          } else {
            console.error(
              `[SALES_ADJUSTMENT_FAILURE] Status transition (${result.previousStatus} -> ${result.newStatus}) committed, but sales adjustment returned false for order ${orderId}.`
            );
            salesWarning = "SALES_SYNC_INCOMPLETE";
          }
        } catch (salesErr) {
          console.error(
            `[SALES_ADJUSTMENT_ERROR] Status transition (${result.previousStatus} -> ${result.newStatus}) committed, but sales adjustment threw error for order ${orderId}:`,
            salesErr
          );
          salesWarning = "SALES_SYNC_INCOMPLETE";
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        ...result,
        salesAdjusted,
        salesWarning,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin order status update error:", error);

    const message =
      error instanceof Error ? error.message : String(error);

    if (
      message ===
      "FORBIDDEN: Administrative privileges required"
    ) {
      return NextResponse.json(
        {
          error: "Administrative privileges required.",
          code: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    if (
      message === "Missing authorization token" ||
      message.includes("Unauthorized")
    ) {
      return NextResponse.json(
        {
          error: "Authentication required.",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    if (message === "ORDER_NOT_FOUND") {
      return NextResponse.json(
        {
          error: "Order not found.",
          code: "ORDER_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    if (
      message === "INVALID_REQUEST" ||
      message === "INVALID_STATUS"
    ) {
      return NextResponse.json(
        {
          error: "Invalid order status request.",
          code: "INVALID_REQUEST",
        },
        { status: 400 }
      );
    }

    if (message === "INVALID_EXISTING_STATUS") {
      return NextResponse.json(
        {
          error: "The order has an invalid existing status.",
          code: "INVALID_EXISTING_STATUS",
        },
        { status: 409 }
      );
    }

    if (message === "DELIVERED_ORDER_CANNOT_BE_CANCELLED") {
      return NextResponse.json(
        {
          error: "Delivered orders cannot be cancelled directly without an authorized return workflow.",
          code: "DELIVERED_ORDER_CANNOT_BE_CANCELLED",
        },
        { status: 409 }
      );
    }

    if (message === "DELIVERED_ORDER_CANNOT_CHANGE_STATUS") {
      return NextResponse.json(
        {
          error: "Delivered orders have completed fulfillment and cannot revert status.",
          code: "DELIVERED_ORDER_CANNOT_CHANGE_STATUS",
        },
        { status: 409 }
      );
    }

    if (message === "CANCELLED_ORDER_CANNOT_BE_DIRECTLY_DELIVERED") {
      return NextResponse.json(
        {
          error: "Cancelled orders cannot transition directly to Delivered. Please reactivate to Processing first.",
          code: "CANCELLED_ORDER_CANNOT_BE_DIRECTLY_DELIVERED",
        },
        { status: 409 }
      );
    }

    if (message === "UNPAID_CARD_ORDER_CANNOT_BE_PROCESSED") {
      return NextResponse.json(
        {
          error: "Card orders cannot be processed, shipped, or delivered until payment is successfully completed.",
          code: "UNPAID_CARD_ORDER_CANNOT_BE_PROCESSED",
        },
        { status: 409 }
      );
    }

    if (message === "CARD_PAYMENT_NOT_COMPLETED") {
      return NextResponse.json(
        {
          error:
            "This Card order cannot be reactivated because payment has not been successfully completed.",
          code: "CARD_PAYMENT_NOT_COMPLETED",
        },
        { status: 409 }
      );
    }

    if (
      message === "INVALID_ORDER_ITEM" ||
      message === "INVALID_ORDER_QUANTITY" ||
      message === "ORDER_HAS_NO_VALID_ITEMS"
    ) {
      return NextResponse.json(
        {
          error:
            "The order contains invalid product information.",
          code: "INVALID_ORDER_DATA",
        },
        { status: 400 }
      );
    }

    if (message.startsWith("PRODUCT_NOT_FOUND:")) {
      return NextResponse.json(
        {
          error: "A product in this order no longer exists.",
          code: "PRODUCT_NOT_FOUND",
        },
        { status: 409 }
      );
    }

    if (message.startsWith("INVALID_PRODUCT_STOCK:")) {
      return NextResponse.json(
        {
          error:
            "A product has invalid inventory data. The order status was not changed.",
          code: "INVALID_PRODUCT_STOCK",
        },
        { status: 409 }
      );
    }

    if (message.startsWith("INSUFFICIENT_STOCK:")) {
      const parts = message.split(":");

      return NextResponse.json(
        {
          error: `Insufficient stock. Available: ${parts[2]}, required: ${parts[3]}.`,
          code: "INSUFFICIENT_STOCK",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "Unable to update order status.",
        code: "ORDER_STATUS_UPDATE_FAILED",
      },
      { status: 500 }
    );
  }
}