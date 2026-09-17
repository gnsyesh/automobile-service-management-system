import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/server-auth";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    // 1. Authenticate customer token
    const decodedToken = await verifyFirebaseToken(request);
    const uid = decodedToken.uid;

    // 2. Parse request payload
    const body = await request.json();
    const { orderId, rating, comment } = body;

    if (!orderId || typeof orderId !== "string" || !orderId.trim()) {
      return NextResponse.json(
        { error: "Missing or invalid order ID", code: "INVALID_ORDER_ID" },
        { status: 400 }
      );
    }

    const cleanOrderId = orderId.trim();
    const parsedRating = Number(rating);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json(
        { error: "Satisfaction rating must be an integer between 1 and 5", code: "INVALID_RATING" },
        { status: 400 }
      );
    }

    const cleanComment = typeof comment === "string" ? comment.trim().slice(0, 1000) : "";

    // 3. Authoritative Order lookup
    const orderRef = adminDb.collection("orders").doc(cleanOrderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return NextResponse.json(
        { error: "Order not found", code: "ORDER_NOT_FOUND" },
        { status: 404 }
      );
    }

    const order = orderDoc.data()!;

    // 4. Verify ownership - IDOR protection
    if (order.userId !== uid) {
      return NextResponse.json(
        { error: "You can only submit feedback for your own orders", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    // 5. Verify order is Delivered
    const currentStatus = order.status || order.orderStatus;
    if (currentStatus !== "Delivered") {
      return NextResponse.json(
        {
          error: "Feedback is only eligible once the order has been delivered",
          code: "ORDER_NOT_DELIVERED",
        },
        { status: 400 }
      );
    }

    // 6. Duplicate feedback prevention
    if (order.feedbackSubmitted) {
      return NextResponse.json(
        {
          error: "Feedback has already been submitted for this order",
          code: "FEEDBACK_ALREADY_SUBMITTED",
        },
        { status: 409 }
      );
    }

    const nowIso = new Date().toISOString();

    // 7. Store feedback in dedicated collection
    await adminDb.collection("orderFeedback").doc(cleanOrderId).set({
      orderId: cleanOrderId,
      userId: uid,
      userEmail: decodedToken.email || order.userEmail || "",
      customerName: order.shippingAddress?.fullName || order.customerDetails?.fullName || "",
      rating: parsedRating,
      comment: cleanComment,
      createdAt: nowIso,
    });

    // 8. Update order document with feedbackSubmitted flag
    await orderRef.update({
      feedbackSubmitted: true,
      feedbackRating: parsedRating,
      feedbackComment: cleanComment,
      feedbackAt: nowIso,
      updatedAt: nowIso,
    });

    return NextResponse.json({
      success: true,
      message: "Order feedback submitted successfully",
      orderId: cleanOrderId,
    });
  } catch (err: any) {
    console.error("Submit order feedback error:", err);
    if (err?.message?.includes("Missing authorization token") || err?.message?.includes("Invalid or expired")) {
      return NextResponse.json(
        { error: "Authentication required", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Unable to submit feedback. Please try again.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
