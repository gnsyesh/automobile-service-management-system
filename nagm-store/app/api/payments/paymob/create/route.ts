import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { amount, currency = "EGP" } = body;

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

    const secretKey = process.env.PAYMOB_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { error: "Paymob is not configured yet" },
        { status: 503 }
      );
    }

    // Paymob integration will be added here once merchant credentials
    // and integration IDs are available.

    return NextResponse.json(
      {
        message: "Paymob configuration detected",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Paymob create payment error:", error);

    return NextResponse.json(
      { error: "Unable to initialize payment" },
      { status: 500 }
    );
  }
}