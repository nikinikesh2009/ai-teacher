"use client";

import { useState } from "react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EditorPanel } from "@/components/admin/EditorPanel";

type Lesson = {
  id: string;
  title: string;
  topicSlug: string;
  version: number;
  created: string;
  status: string;
};

const MOCK_LESSONS: Lesson[] = [
  { id: "les_1", title: "Introduction to Algebra", topicSlug: "algebra-basics", version: 2, created: "2025-02-01", status: "Published" },
  { id: "les_2", title: "Calculus Limits", topicSlug: "calculus-limits", version: 1, created: "2025-02-10", status: "Draft" },
  { id: "les_3", title: "Newton's Laws", topicSlug: "physics-mechanics", version: 3, created: "2025-01-20", status: "Published" },
];

const columns: Column<Lesson>[] = [
  { key: "title", label: "Lesson title" },
  { key: "topicSlug", label: "Topic slug", render: (r) => <span className="font-mono text-xs text-slate-600">{r.topicSlug}</span> },
  { key: "version", label: "Version" },
  { key: "created", label: "Created date" },
  { key: "status", label: "Status", render: (r) => <span className={r.status === "Published" ? "text-emerald-600" : "text-amber-600"}>{r.status}</span> },
];

const MOCK_JSON = `{
  "slides": [
    { "type": "title", "content": "Introduction to Algebra" },
    { "type": "content", "content": "Variables and expressions..." }
  ]
}`;

export function AdminLessonsPageClient() {
  const [lessons] = useState<Lesson[]>(MOCK_LESSONS);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [editJson, setEditJson] = useState(MOCK_JSON);
  const [isEditingJson, setIsEditingJson] = useState(false);

  const openDetail = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setEditJson(MOCK_JSON);
    setIsEditingJson(false);
    setDetailOpen(true);
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={lessons}
        keyField="id"
        emptyMessage="No lessons"
        onRowClick={openDetail}
        actions={(row) => (
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => openDetail(row)} className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100">Edit</button>
            <button type="button" onClick={() => openDetail(row)} className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100">View</button>
            <button type="button" className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
            <button type="button" className="rounded px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50">Publish</button>
          </div>
        )}
      />

      {detailOpen && selectedLesson && (
        <div className="mt-6">
          <EditorPanel
            title={`${selectedLesson.title} — Edit`}
            onClose={() => setDetailOpen(false)}
            footer={
              <>
                <button type="button" onClick={() => setDetailOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                {isEditingJson ? (
                  <button type="button" onClick={() => setIsEditingJson(false)} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">Save JSON</button>
                ) : (
                  <button type="button" onClick={() => setIsEditingJson(true)} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">Edit lesson JSON</button>
                )}
              </>
            }
          >
            {isEditingJson ? (
              <textarea
                value={editJson}
                onChange={(e) => setEditJson(e.target.value)}
                className="h-64 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-sm"
                spellCheck={false}
              />
            ) : (
              <pre className="overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs">{editJson}</pre>
            )}
          </EditorPanel>
        </div>
      )}
    </>
  );
}
