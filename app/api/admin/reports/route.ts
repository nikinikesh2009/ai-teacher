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
    let rows: { id: string; user_id: string | null; reason: string | null; created_at: string; status?: string }[];
    try {
      const r = await sql`
        SELECT id, user_id, reason, created_at, COALESCE(status, 'pending') AS status
        FROM reports
        ORDER BY created_at DESC
      `;
      rows = r as { id: string; user_id: string | null; reason: string | null; created_at: string; status?: string }[];
    } catch {
      const r = await sql`
        SELECT id, user_id, reason, created_at FROM reports ORDER BY created_at DESC
      `;
      rows = (r as { id: string; user_id: string | null; reason: string | null; created_at: string }[]).map((x) => ({ ...x, status: "pending" }));
    }
    const reports = rows.map(
      (r) => ({
        id: String(r.id),
        user: r.user_id ? String(r.user_id).slice(0, 8) + "…" : "—",
        reason: r.reason ?? "—",
        status: (r as { status?: string }).status ?? "pending",
      })
    );
    return NextResponse.json({ reports });
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
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json(
        { error: "id and status required" },
        { status: 400 }
      );
    }
    const allowed = ["pending", "resolved", "dismissed"];
    if (!allowed.includes(String(status))) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    await sql`
      UPDATE reports SET status = ${String(status)} WHERE id = ${id}
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
