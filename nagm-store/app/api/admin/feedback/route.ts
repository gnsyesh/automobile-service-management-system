import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/server-auth";
import { adminDb } from "@/lib/firebase-admin";
import { OrderFeedback } from "@/lib/feedback";

const MAX_HOMEPAGE_FEEDBACK = 3;

export async function GET(request: Request) {
  try {
    // 1. Authorize administrator server-side
    await verifyAdminToken(request);

    // 2. Fetch all genuine customer feedback
    const snapshot = await adminDb.collection("orderFeedback").get();
    const feedbackList: OrderFeedback[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      feedbackList.push({
        orderId: doc.id,
        userId: data.userId || "",
        userEmail: data.userEmail || "",
        customerName: data.customerName || "Customer",
        rating: Number(data.rating) || 5,
        comment: data.comment || "",
        createdAt: data.createdAt || "",
        selectedForHomepage: Boolean(data.selectedForHomepage),
        selectedAt: data.selectedAt || null,
      });
    });

    // Sort newest first
    feedbackList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const selectedCount = feedbackList.filter((f) => f.selectedForHomepage).length;

    return NextResponse.json({
      feedback: feedbackList,
      selectedCount,
      maxAllowed: MAX_HOMEPAGE_FEEDBACK,
    });
  } catch (err: any) {
    console.error("Admin feedback GET error:", err);
    if (err?.message?.includes("FORBIDDEN")) {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required.", code: "FORBIDDEN" },
        { status: 403 }
      );
    }
    if (err?.message?.includes("Missing authorization token") || err?.message?.includes("Invalid or expired")) {
      return NextResponse.json(
        { error: "Authentication required", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Unable to retrieve feedback records", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // 1. Authorize administrator server-side
    await verifyAdminToken(request);

    // 2. Parse request
    const body = await request.json();
    const { orderId, action } = body;

    if (!orderId || typeof orderId !== "string" || !orderId.trim()) {
      return NextResponse.json(
        { error: "Missing or invalid orderId", code: "INVALID_ORDER_ID" },
        { status: 400 }
      );
    }

    if (action !== "select" && action !== "remove") {
      return NextResponse.json(
        { error: "Action must be 'select' or 'remove'", code: "INVALID_ACTION" },
        { status: 400 }
      );
    }

    const cleanOrderId = orderId.trim();
    const feedbackRef = adminDb.collection("orderFeedback").doc(cleanOrderId);
    const feedbackDoc = await feedbackRef.get();

    if (!feedbackDoc.exists) {
      return NextResponse.json(
        { error: "Feedback record not found", code: "FEEDBACK_NOT_FOUND" },
        { status: 404 }
      );
    }

    const currentData = feedbackDoc.data();

    if (action === "select") {
      // Check count of currently selected entries
      const allFeedbackSnap = await adminDb.collection("orderFeedback").get();
      let currentlySelectedCount = 0;
      allFeedbackSnap.forEach((doc) => {
        if (doc.data().selectedForHomepage === true) {
          currentlySelectedCount++;
        }
      });

      // If already selected, no-op
      if (currentData?.selectedForHomepage === true) {
        return NextResponse.json({
          success: true,
          orderId: cleanOrderId,
          selectedForHomepage: true,
          selectedCount: currentlySelectedCount,
        });
      }

      // Enforce strict limit of 3
      if (currentlySelectedCount >= MAX_HOMEPAGE_FEEDBACK) {
        return NextResponse.json(
          {
            error: `Maximum of ${MAX_HOMEPAGE_FEEDBACK} feedback entries can be selected for homepage display. Please remove or replace an existing entry first.`,
            code: "MAX_SELECTIONS_REACHED",
            selectedCount: currentlySelectedCount,
            maxAllowed: MAX_HOMEPAGE_FEEDBACK,
          },
          { status: 400 }
        );
      }

      const nowIso = new Date().toISOString();
      await feedbackRef.update({
        selectedForHomepage: true,
        selectedAt: nowIso,
        updatedAt: nowIso,
      });

      return NextResponse.json({
        success: true,
        orderId: cleanOrderId,
        selectedForHomepage: true,
        selectedCount: currentlySelectedCount + 1,
      });
    } else {
      // action === "remove"
      const nowIso = new Date().toISOString();
      await feedbackRef.update({
        selectedForHomepage: false,
        selectedAt: null,
        updatedAt: nowIso,
      });

      const allFeedbackSnap = await adminDb.collection("orderFeedback").get();
      let newCount = 0;
      allFeedbackSnap.forEach((doc) => {
        if (doc.id !== cleanOrderId && doc.data().selectedForHomepage === true) {
          newCount++;
        }
      });

      return NextResponse.json({
        success: true,
        orderId: cleanOrderId,
        selectedForHomepage: false,
        selectedCount: newCount,
      });
    }
  } catch (err: any) {
    console.error("Admin feedback POST error:", err);
    if (err?.message?.includes("FORBIDDEN")) {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required.", code: "FORBIDDEN" },
        { status: 403 }
      );
    }
    if (err?.message?.includes("Missing authorization token") || err?.message?.includes("Invalid or expired")) {
      return NextResponse.json(
        { error: "Authentication required", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Unable to update feedback selection", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
