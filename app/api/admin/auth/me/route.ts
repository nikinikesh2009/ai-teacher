import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/adminAuth";

function getAdminToken(request: NextRequest): string | null {
  const auth = request.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7).trim() || null;
  return request.cookies.get("tutorflow_admin_token")?.value ?? null;
}

export async function GET(request: NextRequest) {
  const token = getAdminToken(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
  return NextResponse.json({
    admin: {
      id: payload.adminId,
      email: payload.email,
      role: payload.role,
    },
  });
}
