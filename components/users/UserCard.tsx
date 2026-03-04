import Link from "next/link";
import type { UserSummary } from "@/lib/social";

type UserCardProps = {
  user: UserSummary;
};

function formatJoinDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Recently joined";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function UserCard({ user }: UserCardProps) {
  const initials =
    user.username
      .split(/[\s_]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join("") || "TF";

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-sm font-semibold text-gray-900">
              {user.username}
            </h3>
          </div>
          {user.bio ? (
            <p className="line-clamp-2 text-xs text-gray-500">{user.bio}</p>
          ) : (
            <p className="text-xs text-gray-400">
              This learner hasn&apos;t added a bio yet.
            </p>
          )}
          {user.interests.length > 0 ? (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {user.interests.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700"
                >
                  {tag}
                </span>
              ))}
              {user.interests.length > 4 ? (
                <span className="text-[11px] text-gray-400">
                  +{user.interests.length - 4} more
                </span>
              ) : null}
            </div>
          ) : (
            <p className="mt-1 text-[11px] text-gray-400">No interests listed yet</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-gray-400">
        <span>Joined {formatJoinDate(user.joinedAt)}</span>
        <div className="flex gap-2">
          <Link
            href={`/users/${encodeURIComponent(user.username)}`}
            className="inline-flex items-center rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-700 shadow-sm hover:bg-gray-100"
          >
            View Profile
          </Link>
          <Link
            href={`/messages?userId=${encodeURIComponent(user.id)}`}
            className="inline-flex items-center rounded-xl bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Message
          </Link>
        </div>
      </div>
    </article>
  );
}

