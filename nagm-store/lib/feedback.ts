export interface OrderFeedback {
  orderId: string;
  userId: string;
  userEmail?: string;
  customerName: string;
  rating: number; // 1 - 5
  comment: string;
  createdAt: string;
  selectedForHomepage?: boolean;
  selectedAt?: string | null;
}

export interface PublicHomepageFeedback {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

/**
 * Sanitizes genuine feedback entries for public homepage presentation.
 * Explicitly strips sensitive data: email, phone, UID, order ID, address.
 */
export function sanitizeFeedbackForHomepage(
  id: string,
  data: Partial<OrderFeedback>
): PublicHomepageFeedback {
  // Format customer display name safely (e.g. "Ahmed E." or full first name)
  const rawName = (data.customerName || "Verified Customer").trim();
  const nameParts = rawName.split(" ").filter(Boolean);
  let displayName = rawName;
  if (nameParts.length > 1) {
    displayName = `${nameParts[0]} ${nameParts[1][0]}.`;
  }

  return {
    id,
    customerName: displayName,
    rating: Math.max(1, Math.min(5, Number(data.rating) || 5)),
    comment: (data.comment || "").trim(),
    createdAt: data.createdAt || new Date().toISOString(),
  };
}
