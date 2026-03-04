"use client";

import { useState, useEffect } from "react";

export function AdminSettingsClient() {
  const [form, setForm] = useState({
    platformName: "TutorFlow",
    supportEmail: "",
    defaultAiModel: "",
    lessonGenerationLimit: "10",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else
          setForm({
            platformName: data.platformName ?? "TutorFlow",
            supportEmail: data.supportEmail ?? "",
            defaultAiModel: data.defaultAiModel ?? "",
            lessonGenerationLimit: data.lessonGenerationLimit ?? "10",
          });
      })
      .catch(() => setError("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const save = () => {
    setSaving(true);
    setError(null);
    fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
      })
      .catch(() => setError("Failed to save"))
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <p className="text-slate-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700">Platform name</label>
          <input
            type="text"
            value={form.platformName}
            onChange={(e) => setForm((f) => ({ ...f, platformName: e.target.value }))}
            className="mt-1 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Support email</label>
          <input
            type="email"
            value={form.supportEmail}
            onChange={(e) => setForm((f) => ({ ...f, supportEmail: e.target.value }))}
            className="mt-1 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Default AI model</label>
          <input
            type="text"
            value={form.defaultAiModel}
            onChange={(e) => setForm((f) => ({ ...f, defaultAiModel: e.target.value }))}
            placeholder="e.g. gpt-4-turbo"
            className="mt-1 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Lesson generation limit (per user per day)</label>
          <input
            type="number"
            min={1}
            value={form.lessonGenerationLimit}
            onChange={(e) => setForm((f) => ({ ...f, lessonGenerationLimit: e.target.value }))}
            className="mt-1 w-full max-w-md rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="pt-4">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-70"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
