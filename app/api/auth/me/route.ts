import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

function getBearerToken(request: NextRequest): string | null {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return null;
  }
  return auth.slice(7).trim() || null;
}

export async function GET(request: NextRequest) {
  try {
    const token = getBearerToken(request);

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const rows = await sql`
      SELECT id, email, created_at FROM users
      WHERE id = ${payload.userId}
      LIMIT 1
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = rows[0] as { id: string; email: string; created_at: string };

    return NextResponse.json({
      user: { id: user.id, email: user.email, created_at: user.created_at },
    });
  } catch (err) {
    console.error("Me error:", err);
    return NextResponse.json(
      { error: "Failed to get user" },
      { status: 500 }
    );
  }
}
