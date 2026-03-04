"use client";

import { useEffect, useState } from "react";

type Lesson = {
  id: string;
  slug: string;
  title: string;
  topic: string;
  created_at: string;
  updated_at: string;
  approved: boolean;
  version_count: number;
};

type Version = {
  id: string;
  lesson_id: string;
  version_number: number;
  content_json: unknown;
  created_by: string | null;
  created_at: string;
};

export function AdminLessonsClient() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [lessonDetail, setLessonDetail] = useState<{
    lesson: Lesson & { approved: boolean };
    versions: Version[];
  } | null>(null);
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [editJson, setEditJson] = useState("");

  const loadLessons = () => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/lessons")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setLessons(data.lessons ?? []);
      })
      .catch(() => setError("Failed to load lessons"))
      .finally(() => setLoading(false));
  };

  const loadLessonDetail = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setLessonDetail(null);
    setEditingVersionId(null);
    fetch(`/api/admin/lessons?lessonId=${encodeURIComponent(lessonId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setLessonDetail({ lesson: data.lesson, versions: data.versions ?? [] });
      })
      .catch(() => setError("Failed to load lesson"));
  };

  useEffect(() => {
    loadLessons();
  }, []);

  const handleApprove = (lessonId: string, approved: boolean) => {
    fetch("/api/admin/lessons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, approved }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setError(null);
          loadLessons();
          if (selectedLessonId === lessonId && lessonDetail) {
            setLessonDetail({
              ...lessonDetail,
              lesson: { ...lessonDetail.lesson, approved },
            });
          }
        }
      });
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (!confirm("Delete this lesson and all its versions?")) return;
    fetch("/api/admin/lessons", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setError(null);
          setSelectedLessonId(null);
          setLessonDetail(null);
          loadLessons();
        }
      });
  };

  const handleDeleteVersion = (versionId: string) => {
    if (!confirm("Delete this version?")) return;
    fetch("/api/admin/lessons", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setError(null);
          setEditingVersionId(null);
          if (lessonDetail && selectedLessonId)
            loadLessonDetail(selectedLessonId);
        }
      });
  };

  const startEditVersion = (v: Version) => {
    setEditingVersionId(v.id);
    setEditJson(JSON.stringify(v.content_json, null, 2));
  };

  const saveEditVersion = () => {
    if (!editingVersionId) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(editJson);
    } catch {
      setError("Invalid JSON");
      return;
    }
    fetch("/api/admin/lessons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId: editingVersionId, content_json: parsed }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setError(null);
          setEditingVersionId(null);
          if (lessonDetail && selectedLessonId)
            loadLessonDetail(selectedLessonId);
        }
      });
  };

  if (loading && lessons.length === 0) {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
        <p className="text-[var(--color-text-sub)]">Loading lessons...</p>
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

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-soft)]">
        <h2 className="mb-4 text-lg font-medium text-[var(--color-text-main)]">
          All lessons
        </h2>
        {lessons.length === 0 ? (
          <p className="text-sm text-[var(--color-text-sub)]">No lessons yet.</p>
        ) : (
          <ul className="space-y-2">
            {lessons.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3"
              >
                <div>
                  <span className="font-medium text-[var(--color-text-main)]">
                    {l.title}
                  </span>
                  <span className="ml-2 text-sm text-[var(--color-text-sub)]">
                    {l.slug} · {l.version_count} version(s)
                    {l.approved ? " · Approved" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => loadLessonDetail(l.id)}
                    className="rounded border border-[var(--color-border)] px-3 py-1 text-sm hover:bg-[var(--color-surface-alt)]"
                  >
                    View / Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(l.id, !l.approved)}
                    className="rounded border border-[var(--color-border)] px-3 py-1 text-sm hover:bg-[var(--color-surface-alt)]"
                  >
                    {l.approved ? "Unapprove" : "Approve"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteLesson(l.id)}
                    className="rounded border border-[var(--color-danger)] px-3 py-1 text-sm text-[var(--color-danger)] hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {lessonDetail && (
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-soft)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-[var(--color-text-main)]">
              {lessonDetail.lesson.title} — versions
            </h2>
            <button
              type="button"
              onClick={() => setLessonDetail(null)}
              className="text-sm text-[var(--color-text-sub)] hover:underline"
            >
              Close
            </button>
          </div>

          {editingVersionId ? (
            <div className="space-y-2">
              <p className="text-sm text-[var(--color-text-sub)]">
                Edit version JSON (then Save or Cancel)
              </p>
              <textarea
                value={editJson}
                onChange={(e) => setEditJson(e.target.value)}
                className="h-64 w-full rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-2 font-mono text-sm"
                spellCheck={false}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveEditVersion}
                  className="rounded bg-[var(--color-accent)] px-4 py-2 text-sm text-white hover:brightness-110"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingVersionId(null)}
                  className="rounded border border-[var(--color-border)] px-4 py-2 text-sm hover:bg-[var(--color-surface-alt)]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <ul className="space-y-2">
              {lessonDetail.versions.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3"
                >
                  <span className="text-sm">
                    Version {v.version_number}
                    {v.created_by && ` · by ${v.created_by}`}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditVersion(v)}
                      className="rounded border border-[var(--color-border)] px-3 py-1 text-sm hover:bg-[var(--color-surface-alt)]"
                    >
                      Edit JSON
                    </button>
                    {lessonDetail.versions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteVersion(v.id)}
                        className="rounded border border-[var(--color-danger)] px-3 py-1 text-sm text-[var(--color-danger)] hover:bg-red-50"
                      >
                        Delete version
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
