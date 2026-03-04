"use client";

import { useState } from "react";

type MomentComposerProps = {
  placeholder?: string;
  onCreated?: () => void;
};

export function MomentComposer({ placeholder, onCreated }: MomentComposerProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/social/moments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Failed to post moment");
      }

      setContent("");
      setSuccess(true);
      if (onCreated) onCreated();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong while posting.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <label className="block text-xs font-medium text-gray-700">
        Share a quick update
      </label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={
          placeholder ??
          "What are you learning or building right now?"
        }
        rows={3}
        className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="min-h-[18px] text-xs">
          {error && <span className="text-red-600">{error}</span>}
          {!error && success && (
            <span className="text-green-600">Moment posted</span>
          )}
        </div>
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="inline-flex items-center rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
        >
          {submitting ? "Posting…" : "Post Moment"}
        </button>
      </div>
    </form>
  );
}

