import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = neon(databaseUrl);

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT now()
    )
  `;
  console.log("✓ Users table created successfully");

  await sql`
    CREATE TABLE IF NOT EXISTS lessons (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      topic TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_lessons_slug ON lessons(slug)`;
  console.log("✓ Lessons table created successfully");

  await sql`
    CREATE TABLE IF NOT EXISTS lesson_versions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      version_number INTEGER NOT NULL,
      content_json JSONB NOT NULL,
      created_by TEXT,
      created_at TIMESTAMP DEFAULT now(),
      UNIQUE(lesson_id, version_number)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_lesson_versions_lesson_id ON lesson_versions(lesson_id)`;
  console.log("✓ Lesson versions table created successfully");

  await sql`
    CREATE TABLE IF NOT EXISTS user_lessons (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      last_step INTEGER NOT NULL DEFAULT 0,
      progress INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT now(),
      UNIQUE(user_id, lesson_id)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_user_lessons_user_id ON user_lessons(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_user_lessons_lesson_id ON user_lessons(lesson_id)`;
  console.log("✓ User lessons table created successfully");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
