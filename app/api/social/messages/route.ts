import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUserId } from "@/lib/currentUser";
import { ensureSocialTables } from "@/lib/social";

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const conversationId =
      typeof body?.conversationId === "string" ? body.conversationId : "";
    const rawContent = typeof body?.content === "string" ? body.content : "";
    const content = rawContent.trim();

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    await ensureSocialTables();

    const participantRows = await sql`
      SELECT 1
      FROM conversation_participants
      WHERE conversation_id = ${conversationId}
        AND user_id = ${userId}
      LIMIT 1
    `;

    if (!participantRows || participantRows.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rows = await sql`
      INSERT INTO messages (conversation_id, sender_id, content)
      VALUES (${conversationId}, ${userId}, ${content})
      RETURNING id, conversation_id, sender_id, content, created_at
    `;

    const row = rows[0] as {
      id: string;
      conversation_id: string;
      sender_id: string;
      content: string;
      created_at: string | Date | null;
    };

    const createdAt =
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at ?? new Date().toISOString();

    return NextResponse.json({
      message: {
        id: String(row.id),
        conversationId: String(row.conversation_id),
        senderId: String(row.sender_id),
        content: row.content,
        createdAt,
      },
    });
  } catch (err) {
    console.error("Send message error:", err);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

