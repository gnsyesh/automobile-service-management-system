import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/server-auth";
import { adminDb } from "@/lib/firebase-admin";
import { generateInvoicePdf } from "@/lib/invoice-generator";
import { Order } from "@/types";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user token
    const decodedToken = await verifyFirebaseToken(request);
    const uid = decodedToken.uid;

    // 2. Resolve order ID
    const params = await context.params;
    const orderId = params?.id;

    if (!orderId || typeof orderId !== "string" || !orderId.trim()) {
      return NextResponse.json(
        { error: "Missing or invalid order ID", code: "INVALID_ORDER_ID" },
        { status: 400 }
      );
    }

    const cleanOrderId = orderId.trim();

    // 3. Authoritative Firestore order lookup
    const orderRef = adminDb.collection("orders").doc(cleanOrderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return NextResponse.json(
        { error: "Order not found", code: "ORDER_NOT_FOUND" },
        { status: 404 }
      );
    }

    const orderData = { id: orderDoc.id, ...orderDoc.data() } as Order;

    // 4. Server-side ownership verification (IDOR protection)
    const isOwner = orderData.userId === uid;
    let isAdmin = false;

    if (!isOwner) {
      // Check if user has administrative privileges
      const adminDoc = await adminDb.collection("admins").doc(uid).get();
      if (adminDoc.exists && adminDoc.data()?.role === "admin" && adminDoc.data()?.active === true) {
        isAdmin = true;
      }
    }

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        {
          error: "Access denied. You can only download invoices for your own orders.",
          code: "FORBIDDEN",
        },
        { status: 403 }
      );
    }

    // 5. Generate 1-Page A4 PDF dynamically on-the-fly (Never stored permanently)
    const pdfBytes = await generateInvoicePdf(orderData);

    // 6. Return dynamic PDF stream to browser and discard from memory
    return new Response(pdfBytes as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${cleanOrderId}.pdf"`,
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (err: any) {
    console.error("Download invoice error:", err);
    if (err?.message?.includes("Missing authorization token") || err?.message?.includes("Invalid or expired")) {
      return NextResponse.json(
        { error: "Authentication required", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Unable to generate invoice PDF. Please try again.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
