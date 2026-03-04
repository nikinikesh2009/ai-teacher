import Link from "next/link";

export type UserMomentProps = {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  content: string;
  createdAt: string;
  likesCount: number;
  showUserLink?: boolean;
};

function formatTimeAgo(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Just now";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  if (diffDays < 7) return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function UserMoment({
  id,
  userId,
  username,
  avatarUrl,
  content,
  createdAt,
  likesCount,
  showUserLink = true,
}: UserMomentProps) {
  const initials =
    username
      .split(/[\s_]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join("") || "TF";

  const headerContent = (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={username}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-gray-900">{username}</span>
        <span className="text-[11px] text-gray-400">{formatTimeAgo(createdAt)}</span>
      </div>
    </div>
  );

  return (
    <article
      data-moment-id={id}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        {showUserLink ? (
          <Link href={`/users/${encodeURIComponent(username)}`} className="flex-1">
            {headerContent}
          </Link>
        ) : (
          headerContent
        )}

        {likesCount > 0 && (
          <div className="inline-flex items-center rounded-full bg-pink-50 px-2 py-0.5 text-[11px] font-medium text-pink-600">
            <svg
              className="mr-1 h-3 w-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {likesCount}
          </div>
        )}
      </div>

      <p className="mt-3 text-sm text-gray-800 whitespace-pre-wrap">{content}</p>
    </article>
  );
}

