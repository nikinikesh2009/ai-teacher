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
    const [channels, videos, links] = await Promise.all([
      sql`SELECT id, channel_id, name, created_at FROM youtube_channels ORDER BY created_at DESC`,
      sql`SELECT id, video_id, title, lesson_topic, created_at FROM youtube_videos ORDER BY created_at DESC`,
      sql`SELECT id, url, title, description, created_at FROM educational_links ORDER BY created_at DESC`,
    ]);
    return NextResponse.json({
      channels: (channels as Record<string, unknown>[]).map((r) => ({
        id: String(r.id),
        channel_id: r.channel_id,
        name: r.name,
        created_at: r.created_at,
      })),
      videos: (videos as Record<string, unknown>[]).map((r) => ({
        id: String(r.id),
        video_id: r.video_id,
        title: r.title,
        lesson_topic: r.lesson_topic,
        created_at: r.created_at,
      })),
      links: (links as Record<string, unknown>[]).map((r) => ({
        id: String(r.id),
        url: r.url,
        title: r.title,
        description: r.description,
        created_at: r.created_at,
      })),
    });
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
    const { type } = body;

    if (type === "youtube_channel") {
      const { channel_id, name } = body;
      if (!channel_id || !name) {
        return NextResponse.json(
          { error: "channel_id and name required" },
          { status: 400 }
        );
      }
      const [row] = await sql`
        INSERT INTO youtube_channels (channel_id, name)
        VALUES (${String(channel_id).trim()}, ${String(name).trim()})
        RETURNING id, channel_id, name, created_at
      `;
      const r = row as Record<string, unknown>;
      return NextResponse.json({
        id: String(r.id),
        channel_id: r.channel_id,
        name: r.name,
        created_at: r.created_at,
      });
    }

    if (type === "youtube_video") {
      const { video_id, title, lesson_topic } = body;
      if (!video_id || !title) {
        return NextResponse.json(
          { error: "video_id and title required" },
          { status: 400 }
        );
      }
      const topic = lesson_topic != null ? String(lesson_topic).trim() : null;
      const [row] = await sql`
        INSERT INTO youtube_videos (video_id, title, lesson_topic)
        VALUES (${String(video_id).trim()}, ${String(title).trim()}, ${topic})
        RETURNING id, video_id, title, lesson_topic, created_at
      `;
      const r = row as Record<string, unknown>;
      return NextResponse.json({
        id: String(r.id),
        video_id: r.video_id,
        title: r.title,
        lesson_topic: r.lesson_topic,
        created_at: r.created_at,
      });
    }

    if (type === "educational_link") {
      const { url, title, description } = body;
      if (!url || !title) {
        return NextResponse.json(
          { error: "url and title required" },
          { status: 400 }
        );
      }
      const [row] = await sql`
        INSERT INTO educational_links (url, title, description)
        VALUES (${String(url).trim()}, ${String(title).trim()}, ${description != null ? String(description).trim() : null})
        RETURNING id, url, title, description, created_at
      `;
      const r = row as Record<string, unknown>;
      return NextResponse.json({
        id: String(r.id),
        url: r.url,
        title: r.title,
        description: r.description,
        created_at: r.created_at,
      });
    }

    return NextResponse.json(
      { error: "type must be youtube_channel, youtube_video, or educational_link" },
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
    const { type, id } = body;

    if (!type || !id) {
      return NextResponse.json(
        { error: "type and id required" },
        { status: 400 }
      );
    }

    if (type === "youtube_channel") {
      await sql`DELETE FROM youtube_channels WHERE id = ${id}`;
      return NextResponse.json({ ok: true });
    }
    if (type === "youtube_video") {
      await sql`DELETE FROM youtube_videos WHERE id = ${id}`;
      return NextResponse.json({ ok: true });
    }
    if (type === "educational_link") {
      await sql`DELETE FROM educational_links WHERE id = ${id}`;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
