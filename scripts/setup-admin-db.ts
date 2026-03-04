/**
 * Create admin tables. Run once before seeding an admin.
 * Loads .env.local so DATABASE_URL is set.
 */
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set in .env.local");
  }

  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(databaseUrl);

  await sql`
    CREATE TABLE IF NOT EXISTS admins (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email)`;
  console.log("✓ admins table");

  await sql`
    CREATE TABLE IF NOT EXISTS ai_usage_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      kind TEXT,
      created_at TIMESTAMP DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID,
      reason TEXT,
      created_at TIMESTAMP DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS youtube_channels (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      channel_id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS youtube_videos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      video_id TEXT NOT NULL,
      title TEXT NOT NULL,
      lesson_topic TEXT,
      created_at TIMESTAMP DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS educational_links (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS board_assets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      drawing_json JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS ai_prompts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT now()
    )
  `;
  await sql`
    INSERT INTO ai_prompts (key, value) VALUES
      ('teach', 'You are a patient tutor. Explain step by step.'),
      ('discussion', 'Facilitate a thoughtful discussion.'),
      ('exam', 'Generate fair exam questions based on the lesson.'),
      ('flashcard', 'Create concise Q&A pairs suitable for spaced repetition.')
    ON CONFLICT (key) DO NOTHING
  `;
  console.log("✓ admin tables and ai_prompts");

  try {
    const hasReportsStatus = await sql`
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'reports' AND column_name = 'status'
      LIMIT 1
    `;
    if (!hasReportsStatus.length) {
      await sql`ALTER TABLE reports ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'`;
      console.log("✓ reports.status column");
    }
  } catch {
    // ignore
  }

  await sql`
    CREATE TABLE IF NOT EXISTS flashcards (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      lesson_source TEXT,
      created_at TIMESTAMP DEFAULT now()
    )
  `;
  console.log("✓ flashcards table");

  await sql`
    CREATE TABLE IF NOT EXISTS licenses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      plan_type TEXT NOT NULL DEFAULT 'Basic',
      start_date DATE NOT NULL DEFAULT CURRENT_DATE,
      expiry_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT now()
    )
  `;
  console.log("✓ licenses table");

  await sql`
    CREATE TABLE IF NOT EXISTS trainer_applications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      application_text TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT now()
    )
  `;
  console.log("✓ trainer_applications table");

  await sql`
    CREATE TABLE IF NOT EXISTS platform_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT now()
    )
  `;
  await sql`
    INSERT INTO platform_settings (key, value) VALUES
      ('platform_name', 'TutorFlow'),
      ('support_email', 'support@tutorflow.com'),
      ('default_ai_model', 'gpt-4-turbo'),
      ('lesson_generation_limit', '10')
    ON CONFLICT (key) DO NOTHING
  `;
  console.log("✓ platform_settings table");

  try {
    const hasApproved = await sql`
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'lessons' AND column_name = 'approved'
      LIMIT 1
    `;
    if (!hasApproved.length) {
      await sql`ALTER TABLE lessons ADD COLUMN approved BOOLEAN NOT NULL DEFAULT false`;
      console.log("✓ lessons.approved column");
    }
  } catch {
    // lessons table may not exist or column already added
  }

  console.log("\nDone. Run: npx tsx scripts/seed-admin.ts <email> <password>");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
