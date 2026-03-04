import { sql } from "./db";

export type UserProfile = {
  userId: string;
  username: string;
  bio: string;
  avatarUrl: string | null;
  interests: string[];
  joinedAt: string;
  email: string;
};

export type UserSummary = {
  id: string;
  username: string;
  bio: string;
  avatarUrl: string | null;
  interests: string[];
  joinedAt: string;
};

export type MomentSummary = {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  content: string;
  createdAt: string;
  likesCount: number;
};

export type ConversationSummary = {
  id: string;
  otherUserId: string;
  otherUsername: string;
  otherAvatarUrl: string | null;
  lastMessagePreview: string;
  lastMessageAt: string | null;
};

export type ConversationMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export async function ensureSocialTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      username TEXT NOT NULL,
      bio TEXT DEFAULT '',
      avatar_url TEXT,
      interests TEXT[] NOT NULL DEFAULT '{}',
      created_at TIMESTAMP DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS moments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT now(),
      likes_count INTEGER NOT NULL DEFAULT 0
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_moments_user_id_created_at
    ON moments(user_id, created_at DESC)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMP DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS conversation_participants (
      conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      PRIMARY KEY (conversation_id, user_id)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT now()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at
    ON messages(conversation_id, created_at ASC)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_conversation_participants_user
    ON conversation_participants(user_id)
  `;
}

function sanitizeUsernameFromEmail(email: string): string {
  const localPart = email.split("@")[0] || "student";
  // Simple, readable username: lowercase, letters/numbers/underscore only.
  const cleaned = localPart.toLowerCase().replace(/[^a-z0-9_]+/g, "_");
  return cleaned || "student";
}

export async function getOrCreateUserProfile(userId: string): Promise<UserProfile> {
  await ensureSocialTables();

  const rows = await sql`
    SELECT
      u.id AS user_id,
      u.email,
      u.created_at AS joined_at,
      p.username,
      p.bio,
      p.avatar_url,
      p.interests
    FROM users u
    LEFT JOIN user_profiles p ON p.user_id = u.id
    WHERE u.id = ${userId}
    LIMIT 1
  `;

  const row = rows[0] as
    | {
        user_id: string;
        email: string;
        joined_at: string | Date | null;
        username: string | null;
        bio: string | null;
        avatar_url: string | null;
        interests: string[] | null;
      }
    | undefined;

  if (!row) {
    throw new Error("User not found for profile");
  }

  let username = row.username;

  if (!username) {
    username = sanitizeUsernameFromEmail(row.email);

    await sql`
      INSERT INTO user_profiles (user_id, username)
      VALUES (${row.user_id}, ${username})
      ON CONFLICT (user_id) DO NOTHING
    `;
  }

  const joinedAt =
    row.joined_at instanceof Date ? row.joined_at.toISOString() : row.joined_at ?? new Date().toISOString();

  return {
    userId: row.user_id,
    username,
    bio: row.bio ?? "",
    avatarUrl: row.avatar_url ?? null,
    interests: row.interests ?? [],
    joinedAt,
    email: row.email,
  };
}

export async function getUserProfileByUsername(username: string): Promise<UserProfile | null> {
  await ensureSocialTables();

  const rows = await sql`
    SELECT
      u.id AS user_id,
      u.email,
      u.created_at AS joined_at,
      p.username,
      p.bio,
      p.avatar_url,
      p.interests
    FROM user_profiles p
    JOIN users u ON u.id = p.user_id
    WHERE p.username = ${username}
    LIMIT 1
  `;

  const row = rows[0] as
    | {
        user_id: string;
        email: string;
        joined_at: string | Date | null;
        username: string | null;
        bio: string | null;
        avatar_url: string | null;
        interests: string[] | null;
      }
    | undefined;

  if (!row) return null;

  const joinedAt =
    row.joined_at instanceof Date ? row.joined_at.toISOString() : row.joined_at ?? new Date().toISOString();

  return {
    userId: row.user_id,
    username: row.username ?? sanitizeUsernameFromEmail(row.email),
    bio: row.bio ?? "",
    avatarUrl: row.avatar_url ?? null,
    interests: row.interests ?? [],
    joinedAt,
    email: row.email,
  };
}

export async function getDiscoveryForUser(userId: string, limit = 12): Promise<UserSummary[]> {
  const current = await getOrCreateUserProfile(userId);

  const rows = await sql`
    SELECT
      u.id AS user_id,
      u.created_at AS joined_at,
      u.email,
      p.username,
      p.bio,
      p.avatar_url,
      p.interests
    FROM user_profiles p
    JOIN users u ON u.id = p.user_id
    WHERE u.id <> ${userId}
  `;

  const interestsSet = new Set(current.interests.map((t) => t.toLowerCase()));

  const scored = (rows as any[]).map((r) => {
    const userInterests: string[] = (r.interests ?? []) as string[];
    const normalized = userInterests.map((t) => String(t).toLowerCase());
    const sharedCount = normalized.filter((t) => interestsSet.has(t)).length;

    const joinedAt =
      r.joined_at instanceof Date ? r.joined_at.toISOString() : r.joined_at ?? new Date().toISOString();

    const username: string =
      r.username ??
      sanitizeUsernameFromEmail(typeof r.email === "string" ? r.email : String(r.email ?? "student@tutorflow.local"));

    return {
      id: String(r.user_id),
      username,
      bio: (r.bio ?? "") as string,
      avatarUrl: (r.avatar_url ?? null) as string | null,
      interests: (r.interests ?? []) as string[],
      joinedAt,
      sharedCount,
    };
  });

  scored.sort((a, b) => {
    if (b.sharedCount !== a.sharedCount) return b.sharedCount - a.sharedCount;
    return a.joinedAt.localeCompare(b.joinedAt);
  });

  return scored.slice(0, limit).map((r) => ({
    id: r.id,
    username: r.username,
    bio: r.bio,
    avatarUrl: r.avatarUrl,
    interests: r.interests,
    joinedAt: r.joinedAt,
  }));
}

export async function getRecentMoments(limit = 20): Promise<MomentSummary[]> {
  await ensureSocialTables();

  const rows = await sql`
    SELECT
      m.id,
      m.user_id,
      m.content,
      m.created_at,
      m.likes_count,
      p.username,
      p.avatar_url,
      u.email
    FROM moments m
    JOIN users u ON u.id = m.user_id
    LEFT JOIN user_profiles p ON p.user_id = m.user_id
    ORDER BY m.created_at DESC
    LIMIT ${limit}
  `;

  return (rows as any[]).map((r) => {
    const createdAt =
      r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at ?? new Date().toISOString();

    const username: string =
      r.username ??
      sanitizeUsernameFromEmail(typeof r.email === "string" ? r.email : String(r.email ?? "student@tutorflow.local"));

    return {
      id: String(r.id),
      userId: String(r.user_id),
      username,
      avatarUrl: (r.avatar_url ?? null) as string | null,
      content: String(r.content),
      createdAt,
      likesCount: Number(r.likes_count ?? 0),
    };
  });
}

export async function getMomentsForUser(userId: string, limit = 20): Promise<MomentSummary[]> {
  await ensureSocialTables();

  const rows = await sql`
    SELECT
      m.id,
      m.user_id,
      m.content,
      m.created_at,
      m.likes_count,
      p.username,
      p.avatar_url,
      u.email
    FROM moments m
    JOIN users u ON u.id = m.user_id
    LEFT JOIN user_profiles p ON p.user_id = m.user_id
    WHERE m.user_id = ${userId}
    ORDER BY m.created_at DESC
    LIMIT ${limit}
  `;

  return (rows as any[]).map((r) => {
    const createdAt =
      r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at ?? new Date().toISOString();

    const username: string =
      r.username ??
      sanitizeUsernameFromEmail(typeof r.email === "string" ? r.email : String(r.email ?? "student@tutorflow.local"));

    return {
      id: String(r.id),
      userId: String(r.user_id),
      username,
      avatarUrl: (r.avatar_url ?? null) as string | null,
      content: String(r.content),
      createdAt,
      likesCount: Number(r.likes_count ?? 0),
    };
  });
}

export async function getOrCreateConversation(
  currentUserId: string,
  otherUserId: string
): Promise<{ id: string } | null> {
  if (currentUserId === otherUserId) return null;

  await ensureSocialTables();

  const existing = await sql`
    SELECT cp1.conversation_id
    FROM conversation_participants cp1
    JOIN conversation_participants cp2
      ON cp1.conversation_id = cp2.conversation_id
    WHERE cp1.user_id = ${currentUserId}
      AND cp2.user_id = ${otherUserId}
    LIMIT 1
  `;

  const existingRow = existing[0] as { conversation_id: string } | undefined;
  if (existingRow) {
    return { id: String(existingRow.conversation_id) };
  }

  const inserted = await sql`
    INSERT INTO conversations DEFAULT VALUES
    RETURNING id
  `;

  const conversationId = (inserted[0] as { id: string }).id;

  await sql`
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES (${conversationId}, ${currentUserId}), (${conversationId}, ${otherUserId})
  `;

  return { id: String(conversationId) };
}

export async function getConversationsForUser(userId: string): Promise<ConversationSummary[]> {
  await ensureSocialTables();

  const rows = await sql`
    SELECT
      c.id AS conversation_id,
      u_other.id AS other_user_id,
      u_other.email AS other_email,
      p_other.username AS other_username,
      p_other.avatar_url AS other_avatar_url,
      (
        SELECT content
        FROM messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.created_at DESC
        LIMIT 1
      ) AS last_message_content,
      (
        SELECT created_at
        FROM messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.created_at DESC
        LIMIT 1
      ) AS last_message_created_at
    FROM conversations c
    JOIN conversation_participants cp_self
      ON cp_self.conversation_id = c.id
     AND cp_self.user_id = ${userId}
    JOIN conversation_participants cp_other
      ON cp_other.conversation_id = c.id
     AND cp_other.user_id <> ${userId}
    JOIN users u_other
      ON u_other.id = cp_other.user_id
    LEFT JOIN user_profiles p_other
      ON p_other.user_id = u_other.id
    ORDER BY last_message_created_at DESC NULLS LAST, c.created_at DESC
  `;

  return (rows as any[]).map((r) => {
    const lastCreated =
      r.last_message_created_at instanceof Date
        ? r.last_message_created_at.toISOString()
        : r.last_message_created_at ?? null;

    const username: string =
      r.other_username ??
      sanitizeUsernameFromEmail(
        typeof r.other_email === "string" ? r.other_email : String(r.other_email ?? "student@tutorflow.local")
      );

    return {
      id: String(r.conversation_id),
      otherUserId: String(r.other_user_id),
      otherUsername: username,
      otherAvatarUrl: (r.other_avatar_url ?? null) as string | null,
      lastMessagePreview: r.last_message_content ? String(r.last_message_content) : "",
      lastMessageAt: lastCreated,
    };
  });
}

export async function getMessagesForConversation(
  conversationId: string,
  userId: string
): Promise<ConversationMessage[]> {
  await ensureSocialTables();

  const canView = await sql`
    SELECT 1
    FROM conversation_participants
    WHERE conversation_id = ${conversationId}
      AND user_id = ${userId}
    LIMIT 1
  `;

  if (!canView || canView.length === 0) {
    return [];
  }

  const rows = await sql`
    SELECT id, conversation_id, sender_id, content, created_at
    FROM messages
    WHERE conversation_id = ${conversationId}
    ORDER BY created_at ASC
  `;

  return (rows as any[]).map((r) => {
    const createdAt =
      r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at ?? new Date().toISOString();

    return {
      id: String(r.id),
      conversationId: String(r.conversation_id),
      senderId: String(r.sender_id),
      content: String(r.content),
      createdAt,
    };
  });
}

