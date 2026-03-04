"use client";

import { useEffect, useState } from "react";

type PromptsState = {
  teach: string;
  discussion: string;
  exam: string;
};

export function AdminPromptsClient() {
  const [prompts, setPrompts] = useState<PromptsState>({
    teach: "",
    discussion: "",
    exam: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/prompts")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else if (data.prompts) {
          setPrompts({
            teach: data.prompts.teach?.value ?? "",
            discussion: data.prompts.discussion?.value ?? "",
            exam: data.prompts.exam?.value ?? "",
          });
        }
      })
      .catch(() => setError("Failed to load prompts"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    fetch("/api/admin/prompts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prompts),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setSaved(true);
      })
      .catch(() => setError("Failed to save"))
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
        <p className="text-[var(--color-text-sub)]">Loading prompts...</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {saved && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Prompts saved.
        </div>
      )}

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-soft)]">
        <h2 className="mb-4 text-lg font-medium text-[var(--color-text-main)]">
          Edit AI prompts (saved to database)
        </h2>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-sub)]">
              Teach prompt
            </label>
            <textarea
              value={prompts.teach}
              onChange={(e) => setPrompts((p) => ({ ...p, teach: e.target.value }))}
              className="mt-1 h-32 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-sm"
              placeholder="You are a patient tutor..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-sub)]">
              Discussion prompt
            </label>
            <textarea
              value={prompts.discussion}
              onChange={(e) => setPrompts((p) => ({ ...p, discussion: e.target.value }))}
              className="mt-1 h-32 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-sm"
              placeholder="Facilitate a thoughtful discussion..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-sub)]">
              Exam prompt
            </label>
            <textarea
              value={prompts.exam}
              onChange={(e) => setPrompts((p) => ({ ...p, exam: e.target.value }))}
              className="mt-1 h-32 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-sm"
              placeholder="Generate fair exam questions..."
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[var(--color-accent)] px-6 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </section>
    </div>
  );
}
