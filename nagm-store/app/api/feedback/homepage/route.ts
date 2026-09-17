import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sanitizeFeedbackForHomepage, PublicHomepageFeedback } from "@/lib/feedback";

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("orderFeedback")
      .where("selectedForHomepage", "==", true)
      .limit(3)
      .get();

    const homepageFeedback: PublicHomepageFeedback[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      homepageFeedback.push(sanitizeFeedbackForHomepage(doc.id, data));
    });

    // Fallback sort by createdAt desc
    homepageFeedback.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Never exceed 3
    const result = homepageFeedback.slice(0, 3);

    return NextResponse.json({
      success: true,
      feedback: result,
      count: result.length,
    });
  } catch (err: any) {
    console.error("Public homepage feedback GET error:", err);
    // On unexpected error, return empty array rather than failing homepage render
    return NextResponse.json({
      success: true,
      feedback: [],
      count: 0,
    });
  }
}
