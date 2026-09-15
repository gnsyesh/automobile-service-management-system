import { NextResponse } from "next/server";

const PAYMOB_INTENTION_URL = "https://accept.paymob.com/v1/intention/";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      amount,
      currency = "EGP",
      orderId,
      customer,
    } = body;

    // Basic validation
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    if (currency !== "EGP") {
      return NextResponse.json(
        { error: "Only EGP payments are currently supported" },
        { status: 400 }
      );
    }

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json(
        { error: "Missing order ID" },
        { status: 400 }
      );
    }

    if (!customer?.email || !customer?.phone) {
      return NextResponse.json(
        { error: "Customer email and phone are required" },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYMOB_SECRET_KEY;
    const integrationId = process.env.PAYMOB_CARD_INTEGRATION_ID;

    if (!secretKey || !integrationId) {
      return NextResponse.json(
        { error: "Paymob is not configured yet" },
        { status: 503 }
      );
    }

    const integrationIdNumber = Number(integrationId);

    if (!Number.isInteger(integrationIdNumber)) {
      return NextResponse.json(
        { error: "Invalid Paymob integration ID configuration" },
        { status: 500 }
      );
    }

    // Paymob expects the amount in the smallest currency unit.
    // EGP 100.00 -> 10000 piasters.
    const amountInPiasters = Math.round(amount * 100);

    const firstName =
      typeof customer.firstName === "string"
        ? customer.firstName
        : "Customer";

    const lastName =
      typeof customer.lastName === "string"
        ? customer.lastName
        : "Customer";

    const city =
      typeof customer.city === "string" && customer.city.trim()
        ? customer.city
        : "Cairo";

    const state =
      typeof customer.state === "string" && customer.state.trim()
        ? customer.state
        : city;

    const street =
      typeof customer.street === "string" && customer.street.trim()
        ? customer.street
        : "N/A";

    const building =
      typeof customer.building === "string" && customer.building.trim()
        ? customer.building
        : "N/A";

    const intentionPayload = {
      amount: amountInPiasters,
      currency: "EGP",

      payment_methods: [integrationIdNumber],

      items: [
        {
          name: `Negm Store Order ${orderId}`,
          amount: amountInPiasters,
          description: `Payment for Negm Store order ${orderId}`,
          quantity: 1,
        },
      ],

      billing_data: {
        apartment: "N/A",
        first_name: firstName,
        last_name: lastName,
        street,
        building,
        phone_number: customer.phone,
        city,
        country: "EG",
        email: customer.email,
        floor: "N/A",
        state,
      },

      special_reference: orderId,

      // We will add the real production callback URL later.
      // notification_url: "...",
      // redirection_url: "...",
    };

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
          details:
            typeof paymobData === "object"
              ? paymobData
              : String(paymobData),
        },
        { status: paymobResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      intentionId: paymobData.id,
      paymobOrderId: paymobData.intention_order_id,
      clientSecret: paymobData.client_secret,
      status: paymobData.status,
    });
  } catch (error) {
    console.error("Paymob create payment error:", error);

    return NextResponse.json(
      { error: "Unable to initialize payment" },
      { status: 500 }
    );
  }
}