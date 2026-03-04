/**
 * Admin lessons API.
 * GET: list lessons or single lesson with versions
 * PATCH: approve lesson or edit a version's content_json
 * DELETE: delete lesson or a specific version
 */

import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/getAdminFromRequest";

function requireAdmin(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET(request: NextRequest) {
  const unauth = requireAdmin(request);
  if (unauth) return unauth;
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");

    if (lessonId) {
      const lessonRows = await sql`
        SELECT id, slug, title, topic, created_at, updated_at,
               COALESCE(approved, false) AS approved
        FROM lessons WHERE id = ${lessonId} LIMIT 1
      `;
      const lesson = lessonRows[0] as Record<string, unknown> | undefined;
      if (!lesson) {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
      }
      const versionRows = await sql`
        SELECT id, lesson_id, version_number, content_json, created_by, created_at
        FROM lesson_versions WHERE lesson_id = ${lessonId} ORDER BY version_number DESC
      `;
      return NextResponse.json({
        lesson: { ...lesson, id: String(lesson.id) },
        versions: versionRows.map((v: Record<string, unknown>) => ({
          id: String(v.id),
          lesson_id: String(v.lesson_id),
          version_number: v.version_number,
          content_json: v.content_json,
          created_by: v.created_by,
          created_at: v.created_at,
        })),
      });
    }

    const rows = await sql`
      SELECT l.id, l.slug, l.title, l.topic, l.created_at, l.updated_at,
             COALESCE(l.approved, false) AS approved,
             (SELECT COUNT(*) FROM lesson_versions lv WHERE lv.lesson_id = l.id) AS version_count
      FROM lessons l
      ORDER BY l.updated_at DESC
    `;
    const lessons = rows.map((r: Record<string, unknown>) => ({
      ...r,
      id: String(r.id),
    }));
    return NextResponse.json({ lessons });
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

    if (typeof body.approved === "boolean" && body.lessonId) {
      await sql`
        UPDATE lessons SET approved = ${body.approved}, updated_at = now()
        WHERE id = ${body.lessonId}
      `;
      return NextResponse.json({ ok: true });
    }

    if (body.versionId && body.content_json !== undefined) {
      await sql`
        UPDATE lesson_versions SET content_json = ${JSON.stringify(body.content_json)}
        WHERE id = ${body.versionId}
      `;
      const versionRows = await sql`
        SELECT lesson_id FROM lesson_versions WHERE id = ${body.versionId} LIMIT 1
      `;
      if (versionRows.length) {
        const lessonId = (versionRows[0] as { lesson_id: string }).lesson_id;
        await sql`UPDATE lessons SET updated_at = now() WHERE id = ${lessonId}`;
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { error: "Provide lessonId + approved, or versionId + content_json" },
      { status: 400 }
    );
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

    if (body.lessonId) {
      await sql`DELETE FROM lessons WHERE id = ${body.lessonId}`;
      return NextResponse.json({ ok: true });
    }

    if (body.versionId) {
      const versionRows = await sql`
        SELECT lesson_id FROM lesson_versions WHERE id = ${body.versionId} LIMIT 1
      `;
      if (!versionRows.length) {
        return NextResponse.json({ error: "Version not found" }, { status: 404 });
      }
      const countRows = await sql`
        SELECT COUNT(*)::int AS c FROM lesson_versions WHERE lesson_id = ${(versionRows[0] as { lesson_id: string }).lesson_id}
      `;
      const count = (countRows[0] as { c: number }).c;
      if (count <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the only version; delete the lesson instead" },
          { status: 400 }
        );
      }
      await sql`DELETE FROM lesson_versions WHERE id = ${body.versionId}`;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { error: "Provide lessonId or versionId" },
      { status: 400 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
