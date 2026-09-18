import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyFirebaseToken } from "@/lib/server-auth";

const PAYMOB_INTENTION_URL = "https://accept.paymob.com/v1/intention/";
const DEFAULT_PAYMOB_CHECKOUT_BASE_URL =
  "https://accept.paymob.com/unifiedcheckout/";

export async function POST(request: Request) {
  try {
    // 1. Verify authenticated user
    const decodedToken = await verifyFirebaseToken(request);
    const uid = decodedToken.uid;

    // 2. Parse request body
    const body = await request.json();
    const { orderId } = body;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json(
        {
          error: "Missing or invalid order ID",
          code: "INVALID_ORDER_ID",
        },
        { status: 400 }
      );
    }

    // 3. Read the order from Firestore.
    // The Firestore order is authoritative for payment method and pricing.
    const orderDoc = await adminDb
      .collection("orders")
      .doc(orderId)
      .get();

    if (!orderDoc.exists) {
      return NextResponse.json(
        {
          error: "Order not found",
          code: "ORDER_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    const orderData = orderDoc.data();

    if (!orderData) {
      return NextResponse.json(
        {
          error: "Order data unavailable",
          code: "ORDER_DATA_UNAVAILABLE",
        },
        { status: 500 }
      );
    }

    // Ensure the order belongs to the authenticated caller.
    if (orderData.userId !== uid) {
      return NextResponse.json(
        {
          error: "Unauthorized access to this order",
          code: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    // Only Card orders may use the Paymob payment route.
    // The payment method comes from the trusted Firestore order,
    // not from the browser request.
    if (orderData.paymentMethod !== "card") {
      return NextResponse.json(
        {
          error:
            "This order is not configured for Card payment.",
          code: "INVALID_PAYMENT_METHOD",
        },
        { status: 400 }
      );
    }

    // Check payment status.
    if (orderData.paymentStatus === "paid") {
      return NextResponse.json(
        {
          error: "Order is already paid",
          code: "ORDER_ALREADY_PAID",
        },
        { status: 400 }
      );
    }

    // Do not initialize another Paymob payment for a cancelled/failed order.
    if (
      orderData.paymentStatus === "failed" ||
      orderData.status === "Cancelled" ||
      orderData.orderStatus === "Cancelled"
    ) {
      return NextResponse.json(
        {
          error:
            "This order is no longer available for payment.",
          code: "ORDER_NOT_PAYABLE",
        },
        { status: 400 }
      );
    }
    // Do not initialize payment for an expired online order.
  if (orderData.expiresAt) {
    const expiresAtMs = new Date(orderData.expiresAt).getTime();

  if (!Number.isFinite(expiresAtMs)) {
    return NextResponse.json(
      {
        error: "This order has an invalid payment expiration time.",
        code: "INVALID_ORDER_EXPIRATION",
      },
      { status: 400 }
    );
  }

  if (Date.now() >= expiresAtMs) {
    return NextResponse.json(
      {
        error:
          "This payment session has expired. Please place a new order.",
        code: "ORDER_EXPIRED",
      },
      { status: 400 }
    );
  }
}

    // 4. Validate server-only Paymob credentials.
    //
    // IMPORTANT:
    // There is intentionally NO Wallet integration here.
    // Card is the only supported Paymob payment method.
    const secretKey = process.env.PAYMOB_SECRET_KEY;
    const publicKey = process.env.PAYMOB_PUBLIC_KEY;
    const integrationId =
      process.env.PAYMOB_CARD_INTEGRATION_ID;

    // If credentials are not configured yet,
    // return a controlled 503.
    if (!secretKey || !publicKey || !integrationId) {
      return NextResponse.json(
        {
          error:
            "Paymob online payment is not yet configured on this server. Please select Cash on Delivery.",
          code: "PAYMOB_NOT_CONFIGURED",
        },
        { status: 503 }
      );
    }

    const integrationIdNumber = Number(integrationId);

    if (
      !Number.isInteger(integrationIdNumber) ||
      integrationIdNumber <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid Paymob Card integration configuration",
          code: "INVALID_INTEGRATION_ID",
        },
        { status: 500 }
      );
    }

    // 5. Build Paymob Intention payload using
    // TRUSTED server-side order data.
    //
    // Paymob expects amount in piasters:
    // 100 EGP = 10000 piasters.
    const orderTotal = Number(orderData.total);
    if (!Number.isFinite(orderTotal) || orderTotal <= 0) {
      return NextResponse.json(
        {
          error: "Invalid order total",
          code: "INVALID_ORDER_TOTAL",
        },
        { status: 400 }
      );
    }

    const amountInPiasters = Math.round(orderTotal * 100);
    if (!Number.isInteger(amountInPiasters) || amountInPiasters <= 0) {
      return NextResponse.json(
        {
          error: "Invalid order amount calculation",
          code: "INVALID_ORDER_AMOUNT",
        },
        { status: 400 }
      );
    }

    const shippingAddr =
      orderData.shippingAddress || {};

    const customerDetails =
      orderData.customerDetails || {};

    const fullName = (
      shippingAddr.fullName ||
      customerDetails.fullName ||
      ""
    ).trim();

    const email = (
      customerDetails.email ||
      orderData.userEmail ||
      ""
    ).trim();

    const phone = (
      shippingAddr.phone ||
      customerDetails.phone ||
      ""
    ).trim();

    const governorate = (shippingAddr.governorate || "").trim();
    const city = (shippingAddr.city || "").trim();
    const street = (shippingAddr.street || "").trim();
    const building = (shippingAddr.building || "").trim();
    const apartment = (shippingAddr.apartment || "").trim();

    // Reject payment initialization if authentic billing/shipping info is incomplete
    if (!fullName || !email || !phone || !governorate || !city || !street || !building) {
      return NextResponse.json(
        {
          error: "Order is missing required customer or shipping details for card payment.",
          code: "INCOMPLETE_BILLING_DATA",
        },
        { status: 400 }
      );
    }

    const fullNameParts = fullName.split(/\s+/);
    const firstName = fullNameParts[0] || "Customer";
    const lastName = fullNameParts.slice(1).join(" ") || firstName;

    // Build the public origin used by Paymob callbacks.
    // Prioritize NEXT_PUBLIC_APP_URL when configured.
    const configuredAppUrl = (process.env.NEXT_PUBLIC_APP_URL || "").trim().replace(/\/+$/, "");

    const hostHeader =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      "localhost:3000";

    const protoHeader =
      request.headers.get("x-forwarded-proto") ||
      "http";

    const origin = configuredAppUrl || `${protoHeader}://${hostHeader}`;

    const intentionPayload = {
      amount: amountInPiasters,
      currency: "EGP",

      // Card integration only.
      payment_methods: [integrationIdNumber],

      items: [
        {
          name: `Negm Store Order ${orderId}`,
          amount: amountInPiasters,
          description: `Auto parts order ${orderId}`,
          quantity: 1,
        },
      ],

      billing_data: {
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        email,
        country: "EG",
        state: governorate,
        city,
        street,
        building,
        apartment: apartment || "NA",
        floor: "NA",
      },

      // This is the Negm Store order ID used by the webhook
      // to locate the corresponding Firestore order.
      special_reference: orderId,

      notification_url:
        `${origin}/api/payments/paymob/callback`,

      redirection_url:
        `${origin}/api/payments/paymob/callback`,
    };

    // 6. Request Payment Intention from Paymob.
    const paymobResponse = await fetch(
      PAYMOB_INTENTION_URL,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(intentionPayload),
      }
    );

    const paymobData =
      await paymobResponse.json();

    if (!paymobResponse.ok) {
      console.error(
        "Paymob intention creation failed:",
        paymobData
      );

      return NextResponse.json(
        {
          error:
            "Paymob payment initialization failed",
          code: "PAYMOB_INTENTION_FAILED",
        },
        { status: paymobResponse.status }
      );
    }

    const clientSecret =
      paymobData.client_secret;

    if (
      !clientSecret ||
      typeof clientSecret !== "string"
    ) {
      console.error(
        "Paymob intention response missing client_secret:",
        paymobData
      );

      return NextResponse.json(
        {
          error:
            "Paymob returned an invalid payment session",
          code: "PAYMOB_INVALID_SESSION",
        },
        { status: 502 }
      );
    }

    const checkoutBaseUrl =
      process.env.PAYMOB_CHECKOUT_BASE_URL ||
      DEFAULT_PAYMOB_CHECKOUT_BASE_URL;

    const checkoutUrl =
      `${checkoutBaseUrl}?publicKey=${encodeURIComponent(
        publicKey
      )}&clientSecret=${encodeURIComponent(
        clientSecret
      )}`;

    return NextResponse.json({
      success: true,
      intentionId: paymobData.id,
      paymobOrderId:
        paymobData.intention_order_id,
      clientSecret,
      checkoutUrl,
      status: paymobData.status,
    });
  } catch (error: any) {
    console.error(
      "Paymob create payment error:",
      error
    );

    if (
      error?.message ===
      "Missing authorization token"
    ) {
      return NextResponse.json(
        {
          error: "Authentication required",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Unable to initialize payment",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}