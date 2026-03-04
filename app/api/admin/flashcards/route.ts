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
      SELECT id, question, answer, lesson_source, created_at
      FROM flashcards
      ORDER BY created_at DESC
    `;
    const cards = (rows as { id: string; question: string; answer: string; lesson_source: string | null; created_at: string }[]).map(
      (r) => ({
        id: String(r.id),
        question: r.question,
        answer: r.answer,
        lessonSource: r.lesson_source ?? "—",
      })
    );
    return NextResponse.json({ cards });
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
    const { question, answer, lessonSource } = body;
    if (!question || !answer) {
      return NextResponse.json(
        { error: "question and answer required" },
        { status: 400 }
      );
    }
    const [row] = await sql`
      INSERT INTO flashcards (question, answer, lesson_source)
      VALUES (${String(question).trim()}, ${String(answer).trim()}, ${lessonSource != null ? String(lessonSource).trim() : null})
      RETURNING id, question, answer, lesson_source
    `;
    const r = row as Record<string, unknown>;
    return NextResponse.json({
      id: String(r.id),
      question: r.question,
      answer: r.answer,
      lessonSource: r.lesson_source ?? "—",
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
    const { id, question, answer, lessonSource } = body;
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    if (question !== undefined) {
      await sql`UPDATE flashcards SET question = ${String(question).trim()} WHERE id = ${id}`;
    }
    if (answer !== undefined) {
      await sql`UPDATE flashcards SET answer = ${String(answer).trim()} WHERE id = ${id}`;
    }
    if (lessonSource !== undefined) {
      await sql`UPDATE flashcards SET lesson_source = ${lessonSource ? String(lessonSource).trim() : null} WHERE id = ${id}`;
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
    await sql`DELETE FROM flashcards WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
