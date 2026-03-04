"use client";

import { useState, useEffect } from "react";
import { DataTable, type Column } from "@/components/admin/DataTable";

type MediaRow = {
  id: string;
  title: string;
  topic: string;
  sourceType: string;
  url: string;
  _type: "youtube_channel" | "youtube_video" | "educational_link";
};

const columns: Column<MediaRow>[] = [
  { key: "title", label: "Title" },
  { key: "topic", label: "Topic" },
  { key: "sourceType", label: "Source type", render: (r) => <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{r.sourceType}</span> },
  { key: "url", label: "URL", render: (r) => <a href={r.url} className="truncate text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{r.url}</a>, className: "max-w-[200px] truncate" },
];

export function AdminMediaPageClient() {
  const [media, setMedia] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", topic: "", sourceType: "YouTube video", url: "" });

  const load = () => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          const rows: MediaRow[] = [];
          (data.channels ?? []).forEach((c: { id: string; name: string; channel_id: string }) => {
            rows.push({
              id: c.id,
              title: c.name,
              topic: "—",
              sourceType: "YouTube channel",
              url: `https://youtube.com/channel/${c.channel_id}`,
              _type: "youtube_channel",
            });
          });
          (data.videos ?? []).forEach((v: { id: string; title: string; lesson_topic: string | null; video_id: string }) => {
            rows.push({
              id: v.id,
              title: v.title,
              topic: v.lesson_topic ?? "—",
              sourceType: "YouTube video",
              url: `https://youtube.com/watch?v=${v.video_id}`,
              _type: "youtube_video",
            });
          });
          (data.links ?? []).forEach((l: { id: string; title: string; url: string }) => {
            rows.push({
              id: l.id,
              title: l.title,
              topic: "—",
              sourceType: "External",
              url: l.url,
              _type: "educational_link",
            });
          });
          setMedia(rows);
        }
      })
      .catch(() => setError("Failed to load media"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const remove = (row: MediaRow) => {
    if (!confirm("Remove this item?")) return;
    fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: row._type, id: row.id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else load();
      });
  };

  if (loading && media.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <p className="text-slate-500">Loading media...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end">
        <span className="text-sm text-slate-500">
          Add items via API (POST /api/admin/media with type: youtube_channel, youtube_video, or educational_link).
        </span>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <DataTable
        columns={columns}
        data={media}
        keyField="id"
        emptyMessage="No media. Use the Media Manager to add channels, videos, or links."
        actions={(row) => (
          <button
            type="button"
            onClick={() => remove(row)}
            className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        )}
      />
    </>
  );
}
