"use client";

import { useState } from "react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ModalForm } from "@/components/admin/ModalForm";

type Model = {
  id: string;
  name: string;
  provider: string;
  version: string;
  status: string;
};

const MOCK_MODELS: Model[] = [
  { id: "m1", name: "GPT-4", provider: "OpenAI", version: "gpt-4-turbo", status: "Active" },
  { id: "m2", name: "Claude", provider: "Anthropic", version: "claude-3-sonnet", status: "Active" },
  { id: "m3", name: "Gemini", provider: "Google", version: "gemini-1.5-pro", status: "Disabled" },
];

const columns: Column<Model>[] = [
  { key: "name", label: "Model name" },
  { key: "provider", label: "Provider" },
  { key: "version", label: "Version", render: (r) => <span className="font-mono text-xs">{r.version}</span> },
  { key: "status", label: "Status", render: (r) => <span className={r.status === "Active" ? "text-emerald-600" : "text-slate-500"}>{r.status}</span> },
];

export function AdminModelsClient() {
  const [models, setModels] = useState<Model[]>(MOCK_MODELS);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", provider: "", version: "" });

  const addModel = () => {
    setModels((prev) => [
      ...prev,
      { id: `m_${Date.now()}`, ...form, status: "Disabled" },
    ]);
    setAddOpen(false);
    setForm({ name: "", provider: "", version: "" });
  };

  const setStatus = (id: string, status: "Active" | "Disabled") => {
    setModels((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  return (
    <>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Add new model
        </button>
      </div>
      <DataTable
        columns={columns}
        data={models}
        keyField="id"
        emptyMessage="No models configured"
        actions={(row) => (
          <div className="flex items-center gap-1">
            {row.status === "Active" ? (
              <button type="button" onClick={() => setStatus(row.id, "Disabled")} className="rounded px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50">Disable</button>
            ) : (
              <button type="button" onClick={() => setStatus(row.id, "Active")} className="rounded px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50">Activate</button>
            )}
          </div>
        )}
      />
      <p className="mt-3 text-xs text-slate-500">API keys are stored securely and never displayed here.</p>

      <ModalForm
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add AI model"
        footer={
          <>
            <button type="button" onClick={() => setAddOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={addModel} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">Add model</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Model name</label>
            <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. GPT-4" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Provider</label>
            <input type="text" value={form.provider} onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))} placeholder="e.g. OpenAI" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Version / model ID</label>
            <input type="text" value={form.version} onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))} placeholder="e.g. gpt-4-turbo" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>
      </ModalForm>
    </>
  );
}
