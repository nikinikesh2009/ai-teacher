import { NextResponse } from "next/server";
import { loadLessonBySlug } from "@/lib/lessonService";
import { searchVideo } from "@/lib/youtube/searchVideo";
import type { GeneratedStep } from "@/lib/ai/generateLesson";

const VIDEO_STEP_ID = 999;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug?.trim()) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const loaded = await loadLessonBySlug(slug.trim());
    if (!loaded) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const videoId = await searchVideo(loaded.topic);
    const steps: Array<GeneratedStep & { videoId?: string }> = [...loaded.contentJson.steps];

    if (videoId) {
      steps.push({
        id: VIDEO_STEP_ID,
        narration: "Watch this explanation.",
        videoId,
      });
    }

    return NextResponse.json({
      title: loaded.contentJson.title,
      steps,
      slug: loaded.slug,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
