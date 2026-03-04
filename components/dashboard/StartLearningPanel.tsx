 "use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type StartLearningPanelProps = {
  suggestions?: string[];
};

async function startLesson(topic: string): Promise<{ slug?: string }> {
  const res = await fetch("/api/generate-lesson", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error ?? `Failed to generate lesson (${res.status})`);
  }
  return res.json();
}

export function StartLearningPanel({
  suggestions = ["Vectors", "Photosynthesis", "Newton's Laws", "Electric Circuits"],
}: StartLearningPanelProps) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    const trimmed = topic.trim();
    if (!trimmed || isPending) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await startLesson(trimmed);
        if (result.slug) {
          router.push(`/board/${encodeURIComponent(result.slug)}`);
        } else {
          router.push("/board");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong starting your lesson.";
        setError(message);
      }
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setTopic(suggestion);
    // Optionally auto-start when clicking a suggestion
    handleSubmit();
  };

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-500 px-5 py-6 text-white shadow-md sm:px-8 sm:py-8">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.24),_transparent_55%)] opacity-70 sm:block" />

      <div className="relative max-w-xl space-y-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-100">
          Start Learning
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          What do you want to learn today?
        </h1>
        <p className="text-sm text-blue-100">
          Type a topic and TutorFlow will generate guided lessons, examples, and practice
          tailored to you.
        </p>

        <div className="mt-4 space-y-3 sm:space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative flex-1">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Type a topic..."
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-blue-100/80 shadow-sm backdrop-blur focus:border-white focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
                disabled={isPending}
              />
            </label>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!topic.trim() || isPending}
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:opacity-60 disabled:pointer-events-none sm:px-5"
            >
              {isPending ? "Starting..." : "Start Lesson"}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-100">
              {error}
            </p>
          )}

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-100">
              Try one of these
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSuggestionClick(s)}
                  disabled={isPending}
                  className="inline-flex items-center rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-50 shadow-sm ring-1 ring-inset ring-white/20 hover:bg-white/20 disabled:opacity-60 disabled:pointer-events-none"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

