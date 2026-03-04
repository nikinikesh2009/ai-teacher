"use client";

import { useState, useEffect } from "react";
import { EditorPanel } from "@/components/admin/EditorPanel";

type PromptKey = "teach" | "discussion" | "exam" | "flashcard";

const PROMPT_LABELS: Record<PromptKey, string> = {
  teach: "Teaching prompt",
  discussion: "Discussion prompt",
  exam: "Exam prompt",
  flashcard: "Flashcard prompt",
};

type PromptsState = Record<PromptKey, string>;

export function AdminPromptsPageClient() {
  const [prompts, setPrompts] = useState<PromptsState>({
    teach: "",
    discussion: "",
    exam: "",
    flashcard: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PromptKey | null>(null);
  const [editText, setEditText] = useState("");

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
            flashcard: data.prompts.flashcard?.value ?? "",
          });
        }
      })
      .catch(() => setError("Failed to load prompts"))
      .finally(() => setLoading(false));
  }, []);

  const openEditor = (key: PromptKey) => {
    setSelected(key);
    setEditText(prompts[key]);
  };

  const saveChanges = () => {
    if (!selected) return;
    fetch("/api/admin/prompts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [selected]: editText }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setError(null);
          setPrompts((p) => ({ ...p, [selected]: editText }));
          setSelected(null);
        }
      })
      .catch(() => setError("Failed to save"));
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <p className="text-slate-500">Loading prompts...</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <ul className="space-y-2">
        {(Object.keys(PROMPT_LABELS) as PromptKey[]).map((key) => (
          <li
            key={key}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="font-medium text-slate-900">{PROMPT_LABELS[key]}</span>
            <button
              type="button"
              onClick={() => openEditor(key)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Edit
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <div className="mt-6">
          <EditorPanel
            title={PROMPT_LABELS[selected]}
            onClose={() => setSelected(null)}
            footer={
              <>
                <button type="button" onClick={() => setSelected(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="button" onClick={saveChanges} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">Save changes</button>
              </>
            }
          >
            <div>
              <label className="block text-sm font-medium text-slate-700">Prompt text</label>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={10}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </div>
          </EditorPanel>
        </div>
      )}
    </>
  );
}
