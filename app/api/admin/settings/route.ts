import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/getAdminFromRequest";

const SETTING_KEYS = ["platform_name", "support_email", "default_ai_model", "lesson_generation_limit"] as const;

export async function GET(request: NextRequest) {
  if (!getAdminFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const rows = await sql`
      SELECT key, value FROM platform_settings
    `;
    const settings: Record<string, string> = {};
    for (const r of rows as { key: string; value: string }[]) {
      settings[r.key] = r.value;
    }
    return NextResponse.json({
      platformName: settings.platform_name ?? "TutorFlow",
      supportEmail: settings.support_email ?? "",
      defaultAiModel: settings.default_ai_model ?? "",
      lessonGenerationLimit: settings.lesson_generation_limit ?? "10",
    });
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
    const updates: [string, string][] = [];
    if (body.platformName !== undefined) updates.push(["platform_name", String(body.platformName)]);
    if (body.supportEmail !== undefined) updates.push(["support_email", String(body.supportEmail)]);
    if (body.defaultAiModel !== undefined) updates.push(["default_ai_model", String(body.defaultAiModel)]);
    if (body.lessonGenerationLimit !== undefined) updates.push(["lesson_generation_limit", String(body.lessonGenerationLimit)]);
    for (const [key, value] of updates) {
      await sql`
        INSERT INTO platform_settings (key, value, updated_at)
        VALUES (${key}, ${value}, now())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
      `;
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
