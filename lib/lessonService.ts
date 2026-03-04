/**
 * Lesson storage and evolution service.
 * Handles slug generation, load/save from Neon PostgreSQL, and AI improvement.
 */

import { sql } from "@/lib/db";
import { generateLesson } from "@/lib/ai/generateLesson";
import { improveLessonContent } from "@/lib/ai/generateLesson";
import type { GeneratedLesson } from "@/lib/ai/generateLesson";

export type LessonContentJson = GeneratedLesson;

/** "Introduction to Vectors" → "introduction-to-vectors" */
export function generateSlug(topic: string): string {
  return topic
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "lesson";
}

export type LoadedLesson = { contentJson: LessonContentJson; slug: string; topic: string };

/**
 * Load lesson by topic: slug → lookup lesson → return latest version content and slug or null.
 */
export async function loadLesson(topic: string): Promise<LoadedLesson | null> {
  const slug = generateSlug(topic);
  const rows = await sql`
    SELECT l.slug, l.topic, lv.content_json
    FROM lessons l
    JOIN lesson_versions lv ON lv.lesson_id = l.id
    WHERE l.slug = ${slug}
    ORDER BY lv.version_number DESC
    LIMIT 1
  `;
  const row = rows[0] as { slug: string; topic: string; content_json: LessonContentJson } | undefined;
  if (!row?.content_json) return null;
  return { contentJson: row.content_json as LessonContentJson, slug: row.slug, topic: row.topic };
}

/**
 * Load lesson by slug (for shareable links).
 */
export async function loadLessonBySlug(slug: string): Promise<LoadedLesson | null> {
  const rows = await sql`
    SELECT l.slug, l.topic, lv.content_json
    FROM lessons l
    JOIN lesson_versions lv ON lv.lesson_id = l.id
    WHERE l.slug = ${slug}
    ORDER BY lv.version_number DESC
    LIMIT 1
  `;
  const row = rows[0] as { slug: string; topic: string; content_json: LessonContentJson } | undefined;
  if (!row?.content_json) return null;
  return { contentJson: row.content_json as LessonContentJson, slug: row.slug, topic: row.topic };
}

/**
 * Save a new lesson: create lesson row and version 1.
 */
export async function saveLesson(
  topic: string,
  lessonData: LessonContentJson,
  createdBy?: string
): Promise<{ lessonId: string; slug: string }> {
  const slug = generateSlug(topic);
  const title = lessonData.title || topic;

  const [lessonRow] = await sql`
    INSERT INTO lessons (slug, title, topic)
    VALUES (${slug}, ${title}, ${topic})
    RETURNING id
  `;
  const lessonId = (lessonRow as { id: string }).id;

  await sql`
    INSERT INTO lesson_versions (lesson_id, version_number, content_json, created_by)
    VALUES (${lessonId}, 1, ${JSON.stringify(lessonData)}, ${createdBy ?? null})
  `;

  return { lessonId, slug };
}

/**
 * Improve existing lesson with AI and save as new version.
 */
export async function improveLesson(
  lessonId: string,
  options?: { createdBy?: string }
): Promise<LessonContentJson> {
  const [latest] = await sql`
    SELECT content_json, version_number
    FROM lesson_versions
    WHERE lesson_id = ${lessonId}
    ORDER BY version_number DESC
    LIMIT 1
  `;
  if (!latest) {
    throw new Error("Lesson or version not found");
  }

  const current = (latest as { content_json: LessonContentJson }).content_json;
  const nextVersion = (latest as { version_number: number }).version_number + 1;

  const improved = await improveLessonContent(current);

  await sql`
    INSERT INTO lesson_versions (lesson_id, version_number, content_json, created_by)
    VALUES (${lessonId}, ${nextVersion}, ${JSON.stringify(improved)}, ${options?.createdBy ?? null})
  `;

  await sql`
    UPDATE lessons SET updated_at = now() WHERE id = ${lessonId}
  `;

  return improved;
}
