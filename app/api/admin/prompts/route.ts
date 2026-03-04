import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/getAdminFromRequest";

const PROMPT_KEYS = ["teach", "discussion", "exam", "flashcard"] as const;

export async function GET(request: NextRequest) {
  if (!getAdminFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const rows = await sql`
      SELECT key, value, updated_at FROM ai_prompts
      WHERE key IN ('teach', 'discussion', 'exam', 'flashcard')
    `;
    const prompts: Record<string, { value: string; updated_at: string }> = {};
    for (const key of PROMPT_KEYS) {
      prompts[key] = { value: "", updated_at: "" };
    }
    for (const r of rows as { key: string; value: string; updated_at: string }[]) {
      if (PROMPT_KEYS.includes(r.key as (typeof PROMPT_KEYS)[number])) {
        prompts[r.key] = { value: r.value, updated_at: r.updated_at };
      }
    }
    return NextResponse.json({ prompts });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!getAdminFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();

    for (const key of PROMPT_KEYS) {
      if (body[key] !== undefined) {
        await sql`
          INSERT INTO ai_prompts (key, value, updated_at)
          VALUES (${key}, ${String(body[key])}, now())
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
        `;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
