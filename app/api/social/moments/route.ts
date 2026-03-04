import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUserId } from "@/lib/currentUser";
import { getOrCreateUserProfile } from "@/lib/social";

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const rawContent = typeof body?.content === "string" ? body.content : "";
    const content = rawContent.trim();

    if (!content) {
      return NextResponse.json(
        { error: "Moment content is required" },
        { status: 400 }
      );
    }

    const profile = await getOrCreateUserProfile(userId);

    const rows = await sql`
      INSERT INTO moments (user_id, content)
      VALUES (${userId}, ${content})
      RETURNING id, created_at, likes_count
    `;

    const row = rows[0] as {
      id: string;
      created_at: string | Date | null;
      likes_count: number | null;
    };

    const createdAt =
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at ?? new Date().toISOString();

    return NextResponse.json({
      moment: {
        id: String(row.id),
        userId: profile.userId,
        username: profile.username,
        avatarUrl: profile.avatarUrl,
        content,
        createdAt,
        likesCount: Number(row.likes_count ?? 0),
      },
    });
  } catch (err) {
    console.error("Create moment error:", err);
    return NextResponse.json(
      { error: "Failed to create moment" },
      { status: 500 }
    );
  }
}

