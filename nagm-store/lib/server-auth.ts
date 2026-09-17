import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function verifyFirebaseToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("Missing authorization token");
  }

  const idToken = authorization.slice("Bearer ".length).trim();

  if (!idToken) {
    throw new Error("Missing authorization token");
  }

  return adminAuth.verifyIdToken(idToken);
}

export async function verifyAdminToken(request: Request) {
  const decodedToken = await verifyFirebaseToken(request);
  const uid = decodedToken.uid;

  const adminDoc = await adminDb.collection("admins").doc(uid).get();
  if (!adminDoc.exists || adminDoc.data()?.role !== "admin" || adminDoc.data()?.active !== true) {
    throw new Error("FORBIDDEN: Administrative privileges required");
  }

  return decodedToken;
}