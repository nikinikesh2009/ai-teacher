"use client";

import { useEffect, useRef, useState } from "react";
import type { ConversationMessage } from "@/lib/social";

type MessageThreadProps = {
  conversationId: string | null;
  currentUserId: string | null;
  otherUsername?: string;
  initialMessages: ConversationMessage[];
};

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MessageThread({
  conversationId,
  currentUserId,
  otherUsername,
  initialMessages,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>(initialMessages);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, conversationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationId || !content.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/social/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId,
          content: content.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Failed to send message");
      }

      const data = (await res.json()) as { message: ConversationMessage };
      setMessages((prev) => [...prev, data.message]);
      setContent("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong while sending.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!conversationId) {
    return (
      <section className="flex h-full flex-1 flex-col items-center justify-center bg-white/70">
        <p className="text-sm font-medium text-gray-700">
          Select a conversation to start messaging.
        </p>
        <p className="mt-1 text-xs text-gray-500">
          You can open a new conversation from a profile or the dashboard.
        </p>
      </section>
    );
  }

  return (
    <section className="flex h-full flex-1 flex-col bg-white/70">
      <header className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">
          {otherUsername ?? "Conversation"}
        </h2>
        <p className="text-xs text-gray-500">
          Messages are not real-time. They&apos;ll be here when you come back.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-gray-500">
              No messages yet. Say hello to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isMine = currentUserId && msg.senderId === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs rounded-2xl px-3 py-2 text-sm shadow-sm ${
                      isMine
                        ? "rounded-br-md bg-blue-600 text-white"
                        : "rounded-bl-md bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        isMine ? "text-blue-100/80" : "text-gray-500"
                      }`}
                    >
                      {formatTimestamp(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-200 bg-white/90 px-4 py-3"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a message…"
            rows={2}
            className="max-h-24 flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="inline-flex h-9 items-center rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
          >
            {submitting ? "Sending…" : "Send"}
          </button>
        </div>
        <div className="mt-1 min-h-[18px] text-xs text-red-600">
          {error ? error : null}
        </div>
      </form>
    </section>
  );
}

