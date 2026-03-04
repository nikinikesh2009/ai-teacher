import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/getAdminFromRequest";
import { hashPassword } from "@/lib/auth";

async function ensureUserStatusColumn() {
  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Active'
  `;
}

export async function GET(request: NextRequest) {
  if (!getAdminFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await ensureUserStatusColumn();
    const rows = await sql`
      SELECT id, email, created_at, status
      FROM users
      ORDER BY created_at DESC
    `;
    const users = (rows as { id: string; email: string; created_at: string | Date | null; status: string | null }[]).map(
      (r) => ({
        id: String(r.id),
        name: r.email.split("@")[0] || "—",
        email: r.email,
        role: "User",
        created: r.created_at != null ? String(r.created_at).slice(0, 10) : "—",
        status: r.status ?? "Active",
      })
    );
    return NextResponse.json({ users });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureUserStatusColumn();
    const body = await request.json();
    const { id, status, email, password } = body as {
      id?: string;
      status?: string;
      email?: string;
      password?: string;
    };

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    if (status) {
      if (!["Active", "Suspended"].includes(status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }
      await sql`
        UPDATE users
        SET status = ${status}
        WHERE id = ${id}
      `;
    }

    if (email) {
      const trimmed = String(email).trim().toLowerCase();
      await sql`
        UPDATE users
        SET email = ${trimmed}
        WHERE id = ${id}
      `;
    }

    if (password) {
      const hash = await hashPassword(password);
      await sql`
        UPDATE users
        SET password_hash = ${hash}
        WHERE id = ${id}
      `;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
