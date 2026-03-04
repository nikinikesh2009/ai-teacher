"use client";

import { useState, useEffect } from "react";
import { ModalForm } from "@/components/admin/ModalForm";
import WhiteboardEditor from "@/components/whiteboard/WhiteboardEditor";
import type { BoardElement } from "@/lib/boardTypes";

type Asset = {
  id: string;
  name: string;
  category?: string;
  drawingJson: string;
};

export function AdminAssetsPageClient() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<Asset | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    drawingJson: "[]",
  });
  const [editorElements, setEditorElements] = useState<BoardElement[]>([]);
  const [aiDescription, setAiDescription] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/assets")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          const list = (data.assets ?? []).map(
            (a: { id: string; name: string; drawing_json: unknown }) => ({
              id: a.id,
              name: a.name,
              drawingJson:
                typeof a.drawing_json === "string"
                  ? a.drawing_json
                  : JSON.stringify(a.drawing_json ?? [], null, 2),
            })
          );
          setAssets(list);
        }
      })
      .catch(() => setError("Failed to load assets"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setSelected(null);
    setForm({
      name: "",
      category: "",
      drawingJson: "[]",
    });
    setEditorElements([]);
    setAiDescription("");
    setEditOpen(true);
  };

  const openEdit = (asset: Asset) => {
    setSelected(asset);
    setForm({
      name: asset.name,
      category: asset.category ?? "",
      drawingJson: asset.drawingJson,
    });
    try {
      const parsed = JSON.parse(asset.drawingJson) as BoardElement[];
      setEditorElements(parsed);
    } catch {
      setEditorElements([]);
    }
    setAiDescription("");
    setEditOpen(true);
  };

  const handleGenerateWithAI = async () => {
    const desc = aiDescription.trim();
    if (!desc) return;
    setAiLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/assets/generate-drawing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: desc }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? `AI generation failed (${res.status})`);
        return;
      }
      if (Array.isArray(data.elements)) {
        setEditorElements(data.elements as BoardElement[]);
      }
    } catch {
      setError("Failed to call AI drawing generator");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSeedStarterAssets = async () => {
    setSeedLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/assets/bootstrap", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? `Failed to generate starter assets (${res.status})`);
        return;
      }
      await load();
    } catch {
      setError("Failed to generate starter assets");
    } finally {
      setSeedLoading(false);
    }
  };

  const saveEdit = () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(JSON.stringify(editorElements));
    } catch {
      setError("Invalid board data");
      return;
    }

    const payload = {
      name: form.name.trim(),
      drawing_json: parsed,
    } as { id?: string; name: string; drawing_json: unknown };

    const method = selected ? "PATCH" : "POST";
    if (selected) {
      payload.id = selected.id;
    }

    fetch("/api/admin/assets", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setError(null);
          setEditOpen(false);
          setSelected(null);
          setEditorElements([]);
          load();
        }
      });
  };

  if (loading && assets.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <p className="text-slate-500">Loading assets...</p>
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
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Reusable diagrams for the AI whiteboard
        </p>
        <button
          type="button"
          onClick={openNew}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Create asset
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
          >
            <div className="flex h-32 items-center justify-center bg-slate-100 border-b border-slate-200">
              <span className="text-xs text-slate-500">Canvas preview</span>
            </div>
            <div className="p-4">
              <p className="font-medium text-slate-900">{asset.name}</p>
              <button
                type="button"
                onClick={() => openEdit(asset)}
                className="mt-3 w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
      {assets.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500 space-y-3">
          <p>No whiteboard assets yet.</p>
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={openNew}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Create asset manually
            </button>
            <button
              type="button"
              onClick={handleSeedStarterAssets}
              disabled={seedLoading}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 disabled:pointer-events-none hover:bg-slate-800"
            >
              {seedLoading ? "Generating 20 assets..." : "Generate 20 starter assets with AI"}
            </button>
          </div>
        </div>
      )}

      <ModalForm
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit whiteboard asset"
        footer={
          <>
            <button type="button" onClick={() => setEditOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={saveEdit} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">Save</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Asset name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="h-64">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Drawing editor
            </label>
            <WhiteboardEditor
              mode="asset"
              elements={editorElements}
              onChange={setEditorElements}
              className="w-full h-full rounded-lg border border-slate-200 bg-slate-50"
            />
            <p className="mt-1 text-xs text-slate-500">
              Double-click on the board to place simple points (circles). We can
              extend this to richer tools later.
            </p>
            <div className="mt-4 space-y-2">
              <label className="block text-xs font-medium text-slate-600">
                Or describe this asset and let AI sketch it
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  placeholder="e.g. Binary tree with 3 levels"
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
                  disabled={aiLoading}
                />
                <button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={aiLoading || !aiDescription.trim()}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60 disabled:pointer-events-none hover:bg-slate-800"
                >
                  {aiLoading ? "Generating..." : "Generate with AI"}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                The AI returns simple text, arrows, rectangles, circles and lines
                that you can tweak manually.
              </p>
            </div>
          </div>
        </div>
      </ModalForm>
    </>
  );
}
