import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/getAdminFromRequest";

export async function GET(request: NextRequest) {
  if (!getAdminFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const [
      usersRow,
      lessonsRow,
      flashcardsRow,
      aiUsageRow,
      aiTodayRow,
      reportsRow,
      reportsPendingRow,
    ] = await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM users`.then((r) => (r[0] as { count: number })?.count ?? 0),
      sql`SELECT COUNT(*)::int AS count FROM lessons`.then((r) => (r[0] as { count: number })?.count ?? 0),
      sql`SELECT COUNT(*)::int AS count FROM flashcards`.then((r) => (r[0] as { count: number })?.count ?? 0).catch(() => 0),
      sql`SELECT COUNT(*)::int AS count FROM ai_usage_log`.then((r) => (r[0] as { count: number })?.count ?? 0),
      sql`SELECT COUNT(*)::int AS count FROM ai_usage_log WHERE created_at >= CURRENT_DATE`.then((r) => (r[0] as { count: number })?.count ?? 0),
      sql`SELECT COUNT(*)::int AS count FROM reports`.then((r) => (r[0] as { count: number })?.count ?? 0),
      sql`SELECT COUNT(*)::int AS count FROM reports WHERE COALESCE(status, 'pending') = 'pending'`.then((r) => (r[0] as { count: number })?.count ?? 0).catch(() => 0),
    ]);

    return NextResponse.json({
      totalUsers: usersRow ?? 0,
      totalLessons: lessonsRow ?? 0,
      totalFlashcards: flashcardsRow ?? 0,
      aiUsage: aiUsageRow ?? 0,
      aiRequestsToday: aiTodayRow ?? 0,
      reportsCount: reportsRow ?? 0,
      reportsPending: reportsPendingRow ?? 0,
      activeDiscussions: 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
