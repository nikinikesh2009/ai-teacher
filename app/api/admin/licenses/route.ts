import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/getAdminFromRequest";

function requireAdmin(request: NextRequest) {
  if (!getAdminFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const unauth = requireAdmin(request);
  if (unauth) return unauth;
  try {
    const rows = await sql`
      SELECT id, user_id, plan_type, start_date, expiry_date, status
      FROM licenses
      ORDER BY created_at DESC
    `;
    const licenses = (rows as { id: string; user_id: string; plan_type: string; start_date: string; expiry_date: string; status: string }[]).map(
      (r) => ({
        id: String(r.id),
        user: String(r.user_id).slice(0, 8) + "…",
        planType: r.plan_type,
        startDate: r.start_date?.slice(0, 10) ?? "—",
        expiryDate: r.expiry_date?.slice(0, 10) ?? "—",
        status: r.status,
      })
    );
    return NextResponse.json({ licenses });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const unauth = requireAdmin(request);
  if (unauth) return unauth;
  try {
    const body = await request.json();
    const { id, status, expiryDate, planType } = body;
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    if (status !== undefined) {
      await sql`UPDATE licenses SET status = ${String(status)} WHERE id = ${id}`;
    }
    if (expiryDate !== undefined) {
      await sql`UPDATE licenses SET expiry_date = ${String(expiryDate)} WHERE id = ${id}`;
    }
    if (planType !== undefined) {
      await sql`UPDATE licenses SET plan_type = ${String(planType)} WHERE id = ${id}`;
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
