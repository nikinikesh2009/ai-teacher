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
      SELECT id, name, email, application_text, status
      FROM trainer_applications
      ORDER BY created_at DESC
    `;
    const applications = (rows as { id: string; name: string; email: string; application_text: string; status: string }[]).map(
      (r) => ({
        id: String(r.id),
        name: r.name,
        email: r.email,
        applicationText: r.application_text,
        status: r.status,
      })
    );
    return NextResponse.json({ applications });
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
    const allowed = ["pending", "approved", "rejected"];
    if (!allowed.includes(String(status))) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    await sql`
      UPDATE trainer_applications SET status = ${String(status)} WHERE id = ${id}
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
