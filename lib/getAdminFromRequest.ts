import type { NextRequest } from "next/server";
import { verifyAdminToken } from "@/lib/adminAuth";
import type { AdminPayload } from "@/lib/adminAuth";

/**
 * Use in API route handlers (Node). Returns admin payload if valid token in cookie or Authorization header.
 */
export function getAdminFromRequest(request: NextRequest): AdminPayload | null {
  const auth = request.headers.get("Authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  const cookie = request.cookies.get("tutorflow_admin_token")?.value ?? null;
  const token = bearer || cookie;
  if (!token) return null;
  return verifyAdminToken(token);
}
