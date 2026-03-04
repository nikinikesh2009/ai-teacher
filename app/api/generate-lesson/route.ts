import { NextResponse } from "next/server";
import { generateLesson } from "@/lib/ai/generateLesson";
import { loadLesson, saveLesson } from "@/lib/lessonService";
import { searchVideo } from "@/lib/youtube/searchVideo";
import type { GeneratedStep } from "@/lib/ai/generateLesson";

const VIDEO_STEP_ID = 999;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const topic = typeof body?.topic === "string" ? body.topic.trim() : "";

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    let content = await loadLesson(topic);
    let slug: string;

    if (!content) {
      const generated = await generateLesson(topic);
      const saved = await saveLesson(topic, generated);
      slug = saved.slug;
      content = { contentJson: generated, slug, topic };
    } else {
      slug = content.slug;
    }

    const videoId = await searchVideo(content.topic);
    const steps: Array<GeneratedStep & { videoId?: string }> = [...content.contentJson.steps];

    if (videoId) {
      const videoStep = {
        id: VIDEO_STEP_ID,
        narration: "Watch this explanation.",
        videoId,
      };
      steps.push(videoStep);
    }

    return NextResponse.json({
      title: content.contentJson.title,
      steps,
      slug,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
