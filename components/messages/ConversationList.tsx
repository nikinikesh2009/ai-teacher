import Link from "next/link";
import type { ConversationSummary } from "@/lib/social";

type ConversationListProps = {
  conversations: ConversationSummary[];
  selectedId: string | null;
};

function formatTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 60) return `${Math.max(diffMinutes, 1)}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ConversationList({ conversations, selectedId }: ConversationListProps) {
  return (
    <aside className="flex h-full flex-col border-r border-gray-200 bg-white/60">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Conversations</h2>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-4 py-6">
          <p className="text-xs text-gray-500 text-center">
            You don&apos;t have any conversations yet.
            <br />
            Start by messaging someone from the dashboard.
          </p>
        </div>
      ) : (
        <nav className="flex-1 overflow-y-auto py-2">
          {conversations.map((conv) => {
            const isActive = conv.id === selectedId;
            const initials =
              conv.otherUsername
                .split(/[\s_]+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p.charAt(0).toUpperCase())
                .join("") || "TF";

            return (
              <Link
                key={conv.id}
                href={`/messages?conversationId=${encodeURIComponent(conv.id)}`}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                  {conv.otherAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={conv.otherAvatarUrl}
                      alt={conv.otherUsername}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-gray-900">
                      {conv.otherUsername}
                    </p>
                    {conv.lastMessageAt && (
                      <span className="shrink-0 text-[11px] text-gray-400">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  {conv.lastMessagePreview && (
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-gray-500">
                      {conv.lastMessagePreview}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      )}
    </aside>
  );
}

