-- TutorFlow Admin: run after main setup.sql
-- Admins table and admin-only tables for dashboard, media, assets, prompts.

-- ---------------------------------------------------------------------------
-- Admins (role-based admin authentication)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- ---------------------------------------------------------------------------
-- Lesson approval (optional: add to existing lessons table)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name = 'approved'
  ) THEN
    ALTER TABLE lessons ADD COLUMN approved BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Metrics: AI usage and reports (for dashboard counts)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  reason TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Media sources (YouTube channels, videos, educational links)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS youtube_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS youtube_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  lesson_topic TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS educational_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Reusable whiteboard diagram assets (JSON drawing structure)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS board_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  drawing_json JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- AI prompts (teach, discussion, exam) — editable by admin
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT now()
);

INSERT INTO ai_prompts (key, value) VALUES
  ('teach', 'You are a patient tutor. Explain step by step.'),
  ('discussion', 'Facilitate a thoughtful discussion.'),
  ('exam', 'Generate fair exam questions based on the lesson.')
ON CONFLICT (key) DO NOTHING;
