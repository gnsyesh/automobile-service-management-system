import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyFirebaseToken } from "@/lib/server-auth";

const PAYMOB_INTENTION_URL = "https://accept.paymob.com/v1/intention/";
const DEFAULT_PAYMOB_CHECKOUT_BASE_URL = "https://accept.paymob.com/unifiedcheckout/";

export async function POST(request: Request) {
  try {
    // 1. Verify authenticated user
    const decodedToken = await verifyFirebaseToken(request);
    const uid = decodedToken.uid;

    // 2. Parse request body
    const body = await request.json();
    const { orderId, paymentMethod = "card" } = body;

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid order ID", code: "INVALID_ORDER_ID" },
        { status: 400 }
      );
    }

    // 3. Read the order from Firestore to verify ownership and trusted pricing
    const orderDoc = await adminDb.collection("orders").doc(orderId).get();
    if (!orderDoc.exists) {
      return NextResponse.json(
        { error: "Order not found", code: "ORDER_NOT_FOUND" },
        { status: 404 }
      );
    }

    const orderData = orderDoc.data();
    if (!orderData) {
      return NextResponse.json(
        { error: "Order data unavailable", code: "ORDER_DATA_UNAVAILABLE" },
        { status: 500 }
      );
    }

    // Ensure the order belongs to the authenticated caller
    if (orderData.userId !== uid) {
      return NextResponse.json(
        { error: "Unauthorized access to this order", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    // Check payment status
    if (orderData.paymentStatus === "paid") {
      return NextResponse.json(
        { error: "Order is already paid", code: "ORDER_ALREADY_PAID" },
        { status: 400 }
      );
    }

    // 4. Validate server-only Paymob credentials
    const secretKey = process.env.PAYMOB_SECRET_KEY;
    const publicKey = process.env.PAYMOB_PUBLIC_KEY;
    const isWallet = paymentMethod === "wallet";
    const integrationId = isWallet
      ? process.env.PAYMOB_WALLET_INTEGRATION_ID
      : process.env.PAYMOB_CARD_INTEGRATION_ID;

    // If credentials are not configured yet, return controlled 503
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
    if (!Number.isInteger(integrationIdNumber) || integrationIdNumber <= 0) {
      return NextResponse.json(
        {
          error: "Invalid Paymob integration configuration",
          code: "INVALID_INTEGRATION_ID",
        },
        { status: 500 }
      );
    }

    // 5. Build Paymob Intention payload using TRUSTED server order data
    // Paymob expects amount in piasters (100 EGP = 10000 piasters)
    const amountInPiasters = Math.round(Number(orderData.total) * 100);

    const shippingAddr = orderData.shippingAddress || {};
    const customerDetails = orderData.customerDetails || {};

    const fullNameParts = (shippingAddr.fullName || customerDetails.fullName || "Customer").trim().split(" ");
    const firstName = fullNameParts[0] || "Customer";
    const lastName = fullNameParts.slice(1).join(" ") || "Customer";
    const email = customerDetails.email || orderData.userEmail || "customer@negmstore.com";
    const phone = shippingAddr.phone || customerDetails.phone || "01000000000";

    const hostHeader = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const protoHeader = request.headers.get("x-forwarded-proto") || "http";
    const origin = `${protoHeader}://${hostHeader}`;

    const intentionPayload = {
      amount: amountInPiasters,
      currency: "EGP",
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
        state: shippingAddr.governorate || "Cairo",
        city: shippingAddr.city || "Cairo",
        street: shippingAddr.street || "N/A",
        building: shippingAddr.building || "N/A",
        apartment: shippingAddr.apartment || "N/A",
        floor: "N/A",
      },
      special_reference: orderId,
      notification_url: `${origin}/api/payments/paymob/callback`,
      redirection_url: `${origin}/api/payments/paymob/callback`,
    };

    // 6. Request Payment Intention from Paymob
    const paymobResponse = await fetch(PAYMOB_INTENTION_URL, {
      method: "POST",
      headers: {
        Authorization: `Token ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(intentionPayload),
    });

    const paymobData = await paymobResponse.json();

    if (!paymobResponse.ok) {
      console.error("Paymob intention creation failed:", paymobData);
      return NextResponse.json(
        {
          error: "Paymob payment initialization failed",
          code: "PAYMOB_INTENTION_FAILED",
        },
        { status: paymobResponse.status }
      );
    }

    const clientSecret = paymobData.client_secret;
    const checkoutBaseUrl =
      process.env.PAYMOB_CHECKOUT_BASE_URL || DEFAULT_PAYMOB_CHECKOUT_BASE_URL;

    const checkoutUrl = `${checkoutBaseUrl}?publicKey=${publicKey}&clientSecret=${clientSecret}`;

    return NextResponse.json({
      success: true,
      intentionId: paymobData.id,
      paymobOrderId: paymobData.intention_order_id,
      clientSecret,
      checkoutUrl,
      status: paymobData.status,
    });
  } catch (error: any) {
    console.error("Paymob create payment error:", error);

    if (error?.message === "Missing authorization token") {
      return NextResponse.json(
        { error: "Authentication required", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Unable to initialize payment", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}