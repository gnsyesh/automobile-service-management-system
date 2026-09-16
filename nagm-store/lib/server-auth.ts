import { adminAuth } from "@/lib/firebase-admin";

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