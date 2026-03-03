-- TutorFlow: Users table for authentication
-- Run this in your Neon SQL editor or via migration tool.

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Optional: index for email lookups (unique constraint already creates one)
-- CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
