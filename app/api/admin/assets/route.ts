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
      SELECT id, name, drawing_json, created_at, updated_at
      FROM board_assets
      ORDER BY updated_at DESC
    `;
    const assets = (rows as Record<string, unknown>[]).map((r) => ({
      id: String(r.id),
      name: r.name,
      drawing_json: r.drawing_json,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
    return NextResponse.json({ assets });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const unauth = requireAdmin(request);
  if (unauth) return unauth;
  try {
    const body = await request.json();
    const { name, drawing_json } = body;

    if (!name || drawing_json === undefined) {
      return NextResponse.json(
        { error: "name and drawing_json required" },
        { status: 400 }
      );
    }

    const json =
      typeof drawing_json === "string" ? drawing_json : JSON.stringify(drawing_json);

    const [row] = await sql`
      INSERT INTO board_assets (name, drawing_json)
      VALUES (${String(name).trim()}, ${json}::jsonb)
      RETURNING id, name, drawing_json, created_at, updated_at
    `;
    const r = row as Record<string, unknown>;
    return NextResponse.json({
      id: String(r.id),
      name: r.name,
      drawing_json: r.drawing_json,
      created_at: r.created_at,
      updated_at: r.updated_at,
    });
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
    const { id, name, drawing_json } = body;

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    if (name !== undefined) {
      await sql`UPDATE board_assets SET name = ${String(name).trim()}, updated_at = now() WHERE id = ${id}`;
    }
    if (drawing_json !== undefined) {
      const json =
        typeof drawing_json === "string" ? drawing_json : JSON.stringify(drawing_json);
      await sql`UPDATE board_assets SET drawing_json = ${json}::jsonb, updated_at = now() WHERE id = ${id}`;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const unauth = requireAdmin(request);
  if (unauth) return unauth;
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    await sql`DELETE FROM board_assets WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
