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
function computePaymobHmac(obj: Record<string, any>, hmacSecret: string): string {
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
    .map((val) => (val !== undefined && val !== null ? String(val) : ""))
    .join("");

  return crypto
    .createHmac("sha512", hmacSecret)
    .update(concatenated)
    .digest("hex");
}

function verifyHmacTimingSafe(received: string, computed: string): boolean {
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
 * Only an HMAC-verified webhook can transition an order to "paid".
 */
export async function POST(request: Request) {
  try {
    const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
    if (!hmacSecret) {
      console.warn("Paymob webhook received but PAYMOB_HMAC_SECRET is not configured");
      return NextResponse.json(
        { error: "Paymob HMAC secret not configured on server", code: "HMAC_NOT_CONFIGURED" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryHmac = searchParams.get("hmac");

    const body = await request.json();
    const transactionObj = body.obj || body;

    // Determine HMAC to verify: query string or header or body
    const receivedHmac =
      queryHmac ||
      request.headers.get("x-paymob-hmac") ||
      (typeof body.hmac === "string" ? body.hmac : null);

    if (!receivedHmac) {
      return NextResponse.json(
        { error: "Missing HMAC signature", code: "MISSING_HMAC" },
        { status: 401 }
      );
    }

    // Compute expected HMAC
    const expectedHmac = computePaymobHmac(transactionObj, hmacSecret);

    if (!verifyHmacTimingSafe(receivedHmac, expectedHmac)) {
      console.warn("Paymob webhook HMAC verification failed");
      return NextResponse.json(
        { error: "Invalid HMAC signature", code: "INVALID_HMAC" },
        { status: 401 }
      );
    }

    // Locate the Negm Store Order ID
    const orderId =
      transactionObj.special_reference ||
      transactionObj.order?.special_reference ||
      transactionObj.merchant_order_id;

    if (!orderId || typeof orderId !== "string") {
      console.warn("Paymob webhook missing special_reference orderId");
      return NextResponse.json(
        { error: "Missing order reference in transaction", code: "ORDER_REF_MISSING" },
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

    // Run atomic transaction to update order idempotently
    let updatedOrderForSales: Order | null = null;

    await adminDb.runTransaction(async (transaction) => {
      const orderRef = adminDb.collection("orders").doc(orderId);
      const orderSnap = await transaction.get(orderRef);

      if (!orderSnap.exists) {
        throw new Error(`ORDER_NOT_FOUND:${orderId}`);
      }

      const orderData = orderSnap.data() as Order;

      // Idempotency: If already marked paid, do nothing
      if (orderData.paymentStatus === "paid") {
        return;
      }

      if (isSuccess) {
        // Payment Succeeded
        transaction.update(orderRef, {
          paymentStatus: "paid",
          status: "Processing",
          orderStatus: "Processing",
          paymentTransactionId: transactionId,
          paymentReference: paymobOrderRef,
          salesRecorded: true,
          updatedAt: nowIso,
        });

        updatedOrderForSales = {
          ...orderData,
          paymentStatus: "paid",
          status: "Processing",
          orderStatus: "Processing",
          paymentTransactionId: transactionId,
          paymentReference: paymobOrderRef,
          updatedAt: nowIso,
        };
      } else {
        // Payment Failed / Cancelled
        // If stock was reserved/decremented, restore it
        if (orderData.stockDecremented && Array.isArray(orderData.items)) {
          for (const item of orderData.items) {
            const pid = item.product?.id;
            const qty = item.quantity || 1;
            if (pid) {
              const prodRef = adminDb.collection("products").doc(pid);
              transaction.update(prodRef, {
                stockCount: (item.product?.stockCount ?? 0) + qty,
                inStock: true,
                updatedAt: nowIso,
              });
            }
          }
        }

        transaction.update(orderRef, {
          paymentStatus: "failed",
          status: "Cancelled",
          orderStatus: "Cancelled",
          stockDecremented: false,
          paymentTransactionId: transactionId || undefined,
          updatedAt: nowIso,
        });
      }
    });

    // Record server-side sales aggregation if newly confirmed paid
    if (updatedOrderForSales) {
      try {
        await recordOrderSalesServer(updatedOrderForSales);
      } catch (salesErr) {
        console.warn("Could not record sales for paid Paymob order:", salesErr);
      }
    }

    return NextResponse.json({ received: true, success: isSuccess });
  } catch (error: any) {
    console.error("Paymob webhook processing error:", error);

    if (error?.message?.startsWith("ORDER_NOT_FOUND:")) {
      return NextResponse.json(
        { error: "Order not found", code: "ORDER_NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Webhook processing error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * GET: Customer Browser Redirection
 * Handles the customer returning from Paymob Unified Checkout.
 * RULE: A browser redirect NEVER marks an order as paid by itself.
 * It strictly inspects the authoritative Firestore state and directs the customer appropriately.
 */
export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url);

    // Paymob redirect query params
    const orderId =
      searchParams.get("special_reference") ||
      searchParams.get("merchant_order_id") ||
      searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.redirect(`${origin}/checkout`);
    }

    const orderDoc = await adminDb.collection("orders").doc(orderId).get();
    if (!orderDoc.exists) {
      return NextResponse.redirect(`${origin}/checkout?error=order_not_found`);
    }

    const orderData = orderDoc.data();
    const paymentStatus = orderData?.paymentStatus;

    if (paymentStatus === "paid") {
      return NextResponse.redirect(`${origin}/order-success?orderId=${encodeURIComponent(orderId)}`);
    }

    if (paymentStatus === "failed") {
      return NextResponse.redirect(
        `${origin}/checkout?error=payment_failed&orderId=${encodeURIComponent(orderId)}`
      );
    }

    // Webhook callback might still be in-flight; show pending confirmation
    return NextResponse.redirect(
      `${origin}/order-success?orderId=${encodeURIComponent(orderId)}&status=pending`
    );
  } catch (error) {
    console.error("Paymob GET redirect handler error:", error);
    const { origin } = new URL(request.url);
    return NextResponse.redirect(`${origin}/checkout`);
  }
}
