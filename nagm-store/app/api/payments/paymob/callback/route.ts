import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { adminDb } from "@/lib/firebase-admin";
import { recordOrderSalesServer } from "@/lib/server-sales";
import { Order } from "@/types";

/**
 * Computes the Paymob HMAC-SHA512 according to Paymob's documented algorithm.
 * Concatenates:
 * amount_cents + created_at + currency + error_occured + has_parent_transaction +
 * id + integration_id + is_3d_secure + is_auth + is_capture + is_refunded +
 * is_standalone_payment + is_voided + order.id + owner + pending +
 * source_data.pan + source_data.sub_type + source_data.type + success
 */
function computePaymobHmac(
  obj: Record<string, any>,
  hmacSecret: string
): string {
  const fields = [
    obj.amount_cents,
    obj.created_at,
    obj.currency,
    obj.error_occured,
    obj.has_parent_transaction,
    obj.id,
    obj.integration_id,
    obj.is_3d_secure,
    obj.is_auth,
    obj.is_capture,
    obj.is_refunded,
    obj.is_standalone_payment,
    obj.is_voided,
    obj.order?.id ?? obj["order.id"] ?? "",
    obj.owner,
    obj.pending,
    obj.source_data?.pan ?? obj["source_data.pan"] ?? "",
    obj.source_data?.sub_type ?? obj["source_data.sub_type"] ?? "",
    obj.source_data?.type ?? obj["source_data.type"] ?? "",
    obj.success,
  ];

  const concatenated = fields
    .map((val) =>
      val !== undefined && val !== null ? String(val) : ""
    )
    .join("");

  return crypto
    .createHmac("sha512", hmacSecret)
    .update(concatenated)
    .digest("hex");
}

function verifyHmacTimingSafe(
  received: string,
  computed: string
): boolean {
  try {
    const bufA = Buffer.from(received, "hex");
    const bufB = Buffer.from(computed, "hex");

    if (bufA.length !== bufB.length) {
      return false;
    }

    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * POST: Server-to-Server Paymob Webhook
 *
 * Only an HMAC-verified webhook can transition an order to "paid".
 *
 * Stock rules:
 * - COD stock is decremented when the order is created.
 * - Card stock is NOT decremented when the order is created.
 * - Card stock is decremented only after successful Paymob payment.
 * - Failed Card payment does not restore stock because no stock was reserved.
 */
export async function POST(request: Request) {
  try {
    const hmacSecret = process.env.PAYMOB_HMAC_SECRET;

    if (!hmacSecret) {
      console.warn(
        "Paymob webhook received but PAYMOB_HMAC_SECRET is not configured"
      );

      return NextResponse.json(
        {
          error: "Paymob HMAC secret not configured on server",
          code: "HMAC_NOT_CONFIGURED",
        },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryHmac = searchParams.get("hmac");

    const body = await request.json();
    const transactionObj = body.obj || body;

    // Determine HMAC to verify:
    // query string, header, or body.
    const receivedHmac =
      queryHmac ||
      request.headers.get("x-paymob-hmac") ||
      (typeof body.hmac === "string" ? body.hmac : null);

    if (!receivedHmac) {
      return NextResponse.json(
        {
          error: "Missing HMAC signature",
          code: "MISSING_HMAC",
        },
        { status: 401 }
      );
    }

    // Compute expected HMAC.
    const expectedHmac = computePaymobHmac(
      transactionObj,
      hmacSecret
    );

    if (!verifyHmacTimingSafe(receivedHmac, expectedHmac)) {
      console.warn("Paymob webhook HMAC verification failed");

      return NextResponse.json(
        {
          error: "Invalid HMAC signature",
          code: "INVALID_HMAC",
        },
        { status: 401 }
      );
    }

    // Locate the Negm Store Order ID.
    const orderId =
      transactionObj.special_reference ||
      transactionObj.order?.special_reference ||
      transactionObj.merchant_order_id;

    if (!orderId || typeof orderId !== "string") {
      console.warn(
        "Paymob webhook missing special_reference orderId"
      );

      return NextResponse.json(
        {
          error: "Missing order reference in transaction",
          code: "ORDER_REF_MISSING",
        },
        { status: 400 }
      );
    }

    const isSuccess =
      Boolean(transactionObj.success) === true &&
      Boolean(transactionObj.error_occured) === false &&
      Boolean(transactionObj.pending) === false;

    const transactionId = String(transactionObj.id || "");
    const paymobOrderRef = String(transactionObj.order?.id || "");
    const nowIso = new Date().toISOString();

    // Run an atomic transaction to update the order and,
    // for successful Card payments, decrement current stock.
    const updatedOrderForSales = await adminDb.runTransaction<Order | null>(async (transaction) => {
      const orderRef = adminDb
        .collection("orders")
        .doc(orderId);

      const orderSnap = await transaction.get(orderRef);

      if (!orderSnap.exists) {
        throw new Error(`ORDER_NOT_FOUND:${orderId}`);
      }

      const orderData = orderSnap.data() as Order;

      // Idempotency:
      // If already marked paid, do nothing.
      if (orderData.paymentStatus === "paid") {
        return null;
      }
            // Do not accept a successful payment for an expired Card order.
      if (isSuccess && orderData.expiresAt) {
        const expiresAtMs = new Date(orderData.expiresAt).getTime();

        if (!Number.isFinite(expiresAtMs)) {
          throw new Error(`INVALID_ORDER_EXPIRATION:${orderId}`);
        }

        if (Date.now() >= expiresAtMs) {
          throw new Error(`ORDER_EXPIRED:${orderId}`);
        }
      }

      if (isSuccess) {
        // Successful Paymob payment must belong to a Card order.
        if (orderData.paymentMethod !== "card") {
          throw new Error(
            `INVALID_PAYMENT_METHOD_FOR_CARD_CALLBACK:${orderId}`
          );
        }

        /*
         * Aggregate quantities by product ID first.
         *
         * This prevents incorrect stock calculations if the same
         * product appears more than once in the order.
         *
         * Example:
         * Product A × 3
         * Product A × 2
         * becomes:
         * Product A → 5
         */
        if (!Array.isArray(orderData.items)) {
          throw new Error(`INVALID_ORDER_ITEMS:${orderId}`);
        }

        const requiredQuantities = new Map<string, number>();

        for (const item of orderData.items) {
          const pid = item.product?.id;
          const qty = Number(item.quantity || 1);

          if (
            !pid ||
            typeof pid !== "string" ||
            !Number.isInteger(qty) ||
            qty <= 0
          ) {
            throw new Error(`INVALID_ORDER_ITEM:${orderId}`);
          }

          const previousQty =
            requiredQuantities.get(pid) || 0;

          const totalQty = previousQty + qty;

          if (!Number.isSafeInteger(totalQty)) {
            throw new Error(`INVALID_ORDER_ITEM:${orderId}`);
          }

          requiredQuantities.set(pid, totalQty);
        }

        /*
         * Read and validate every unique product before making
         * any stock update.
         *
         * All reads happen inside the same Firestore transaction.
         */
        const productUpdates: Array<{
          ref: any;
          newStockCount: number;
        }> = [];

        for (const [pid, requiredQty] of requiredQuantities) {
          const productRef = adminDb
            .collection("products")
            .doc(pid);

          const productSnap =
            await transaction.get(productRef);

          if (!productSnap.exists) {
            throw new Error(`PRODUCT_NOT_FOUND:${pid}`);
          }

          const productData = productSnap.data()!;
          const currentStock = Number(
            productData.stockCount
          );

          if (
            !Number.isFinite(currentStock) ||
            !Number.isInteger(currentStock) ||
            currentStock < 0
          ) {
            throw new Error(`INVALID_STOCK:${pid}`);
          }

          /*
           * Never allow stock to become negative.
           *
           * If Paymob reports a successful payment but the
           * product is no longer available, abort the entire
           * transaction.
           *
           * No stock is changed and the order is not marked paid.
           */
          if (currentStock < requiredQty) {
            throw new Error(
              `INSUFFICIENT_STOCK_AT_PAYMENT:${pid}:${currentStock}:${requiredQty}`
            );
          }

          const newStockCount =
            currentStock - requiredQty;

          productUpdates.push({
            ref: productRef,
            newStockCount,
          });
        }

        /*
         * Every product has now passed validation.
         *
         * Apply all stock changes atomically.
         */
        for (const update of productUpdates) {
          transaction.update(update.ref, {
            stockCount: update.newStockCount,
            inStock: update.newStockCount > 0,
            updatedAt: nowIso,
          });
        }

        /*
         * Only after every product has sufficient current stock,
         * mark the Card order as paid.
         */
        transaction.update(orderRef, {
          paymentStatus: "paid",
          status: "Processing",
          orderStatus: "Processing",
          paymentTransactionId: transactionId,
          paymentReference: paymobOrderRef,
          stockDecremented: true,
          updatedAt: nowIso,
        });

        return {
          ...orderData,
          paymentStatus: "paid",
          status: "Processing",
          orderStatus: "Processing",
          paymentTransactionId: transactionId,
          paymentReference: paymobOrderRef,
          stockDecremented: true,
          updatedAt: nowIso,
        };
      } else {
        /*
         * Payment failed / cancelled.
         *
         * Card stock was NOT decremented when the order
         * was created, so there is NOTHING to restore.
         */
        transaction.update(orderRef, {
          paymentStatus: "failed",
          status: "Cancelled",
          orderStatus: "Cancelled",
          stockDecremented: false,
          paymentTransactionId:
            transactionId || undefined,
          updatedAt: nowIso,
        });
        return null;
      }
    });

    // Record server-side sales aggregation only after
    // a newly confirmed successful Card payment.
    let salesRecordedSuccessfully = false;
    if (updatedOrderForSales) {
      try {
        const salesRecorded = await recordOrderSalesServer(
          updatedOrderForSales
        );
        if (salesRecorded) {
          salesRecordedSuccessfully = true;
          await adminDb.collection("orders").doc(orderId).update({
            salesRecorded: true,
            updatedAt: new Date().toISOString(),
          });
        } else {
          console.error(
            `[SALES_RECORD_FAILURE] Paid Card order ${orderId} (total: ${updatedOrderForSales.total}) confirmed and stock deducted, but sales recording returned false.`
          );
        }
      } catch (salesErr) {
        console.error(
          `[SALES_RECORD_ERROR] Paid Card order ${orderId} (total: ${updatedOrderForSales.total}) confirmed, but sales recording threw error:`,
          salesErr
        );
      }
    }

    return NextResponse.json({
      received: true,
      success: isSuccess,
      salesRecorded: salesRecordedSuccessfully,
    });
  } catch (error: any) {
    console.error(
      "Paymob webhook processing error:",
      error
    );

    if (
      error?.message?.startsWith(
        "ORDER_NOT_FOUND:"
      )
    ) {
      return NextResponse.json(
        {
          error: "Order not found",
          code: "ORDER_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    if (
      error?.message?.startsWith(
        "PRODUCT_NOT_FOUND:"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "A product in this order is no longer available.",
          code: "PRODUCT_NOT_FOUND",
        },
        { status: 409 }
      );
    }

    if (
      error?.message?.startsWith(
        "INSUFFICIENT_STOCK_AT_PAYMENT:"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Payment succeeded, but the requested product is no longer available in the required quantity.",
          code: "INSUFFICIENT_STOCK_AT_PAYMENT",
        },
        { status: 409 }
      );
    }
        if (
      error?.message?.startsWith(
        "ORDER_EXPIRED:"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "This payment session has expired. Please place a new order.",
          code: "ORDER_EXPIRED",
        },
        { status: 409 }
      );
    }

    if (
      error?.message?.startsWith(
        "INVALID_ORDER_EXPIRATION:"
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid order expiration data.",
          code: "INVALID_ORDER_EXPIRATION",
        },
        { status: 500 }
      );
    }

    if (
      error?.message?.startsWith(
        "INVALID_PAYMENT_METHOD_FOR_CARD_CALLBACK:"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "This Paymob transaction does not belong to a Card order.",
          code:
            "INVALID_PAYMENT_METHOD_FOR_CARD_CALLBACK",
        },
        { status: 400 }
      );
    }

    if (
      error?.message?.startsWith(
        "INVALID_ORDER_ITEM:"
      ) ||
      error?.message?.startsWith(
        "INVALID_ORDER_ITEMS:"
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid order items.",
          code: "INVALID_ORDER_ITEMS",
        },
        { status: 400 }
      );
    }

    if (
      error?.message?.startsWith(
        "INVALID_STOCK:"
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid product stock data.",
          code: "INVALID_STOCK",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Webhook processing error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

/**
 * GET: Customer Browser Redirection
 *
 * Handles the customer returning from Paymob Unified Checkout.
 *
 * RULE:
 * A browser redirect NEVER marks an order as paid by itself.
 * It strictly inspects the authoritative Firestore state
 * and directs the customer appropriately.
 */
export async function GET(request: Request) {
  try {
    const { searchParams, origin } =
      new URL(request.url);

    // Paymob redirect query params.
    const orderId =
      searchParams.get("special_reference") ||
      searchParams.get("merchant_order_id") ||
      searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.redirect(
        `${origin}/checkout`
      );
    }

    const orderDoc = await adminDb
      .collection("orders")
      .doc(orderId)
      .get();

    if (!orderDoc.exists) {
      return NextResponse.redirect(
        `${origin}/checkout?error=order_not_found`
      );
    }

    const orderData = orderDoc.data();
    const paymentStatus =
      orderData?.paymentStatus;

    if (paymentStatus === "paid") {
      return NextResponse.redirect(
        `${origin}/order-success?orderId=${encodeURIComponent(
          orderId
        )}`
      );
    }

    if (paymentStatus === "failed") {
      return NextResponse.redirect(
        `${origin}/checkout?error=payment_failed&orderId=${encodeURIComponent(
          orderId
        )}`
      );
    }

    // Webhook callback might still be in-flight;
    // show pending confirmation.
    return NextResponse.redirect(
      `${origin}/order-success?orderId=${encodeURIComponent(
        orderId
      )}&status=pending`
    );
  } catch (error) {
    console.error(
      "Paymob GET redirect handler error:",
      error
    );

    const { origin } = new URL(request.url);

    return NextResponse.redirect(
      `${origin}/checkout`
    );
  }
}