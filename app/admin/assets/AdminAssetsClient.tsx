"use client";

import { useEffect, useState } from "react";

type Asset = {
  id: string;
  name: string;
  drawing_json: unknown;
  created_at: string;
  updated_at: string;
};

export function AdminAssetsClient() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [jsonText, setJsonText] = useState("[]");

  const load = () => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/assets")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setAssets(data.assets ?? []);
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setShowForm(true);
    setEditingId(null);
    setName("");
    setJsonText("[]");
  };

  const openEdit = (a: Asset) => {
    setShowForm(true);
    setEditingId(a.id);
    setName(a.name);
    setJsonText(
      typeof a.drawing_json === "string"
        ? a.drawing_json
        : JSON.stringify(a.drawing_json, null, 2)
    );
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setError("Invalid JSON");
      return;
    }

    if (editingId) {
      fetch("/api/admin/assets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          name: name.trim(),
          drawing_json: parsed,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.error) setError(data.error);
          else {
            setError(null);
            closeForm();
            load();
          }
        });
    } else {
      fetch("/api/admin/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), drawing_json: parsed }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.error) setError(data.error);
          else {
            setError(null);
            closeForm();
            load();
          }
        });
    }
  };

  const remove = (id: string) => {
    if (!confirm("Delete this board asset?")) return;
    fetch("/api/admin/assets", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setError(null);
          if (editingId === id) closeForm();
          load();
        }
      });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-soft)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-[var(--color-text-main)]">
            Reusable whiteboard diagrams
          </h2>
          <button
            type="button"
            onClick={openNew}
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm text-white hover:brightness-110"
          >
            Create asset
          </button>
        </div>
        <p className="mb-4 text-sm text-[var(--color-text-sub)]">
          Store JSON drawing structure (e.g. text, arrows, lines, rects, circles) for reuse on the board.
        </p>

        {showForm && (
          <form onSubmit={save} className="mb-6 rounded-lg border border-[var(--color-border)] p-4">
            <h3 className="mb-3 font-medium text-[var(--color-text-main)]">
              {editingId ? "Edit asset" : "New asset"}
            </h3>
            <input
              type="text"
              placeholder="Asset name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-3 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              required
            />
            <label className="block text-sm text-[var(--color-text-sub)]">
              Drawing JSON (array of elements)
            </label>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="mt-1 h-48 w-full rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-2 font-mono text-sm"
              spellCheck={false}
            />
            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                className="rounded bg-[var(--color-accent)] px-4 py-2 text-sm text-white hover:brightness-110"
              >
                {editingId ? "Save" : "Create"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="rounded border border-[var(--color-border)] px-4 py-2 text-sm hover:bg-[var(--color-surface-alt)]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-[var(--color-text-sub)]">Loading...</p>
        ) : (
          <ul className="space-y-2">
            {assets.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-[var(--color-border)] p-3"
              >
                <span className="font-medium text-[var(--color-text-main)]">{a.name}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(a)}
                    className="rounded border border-[var(--color-border)] px-3 py-1 text-sm hover:bg-[var(--color-surface-alt)]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(a.id)}
                    className="rounded border border-[var(--color-danger)] px-3 py-1 text-sm text-[var(--color-danger)] hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {assets.length === 0 && !showForm && (
              <li className="text-sm text-[var(--color-text-sub)]">No assets yet.</li>
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
