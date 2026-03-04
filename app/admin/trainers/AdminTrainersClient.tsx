"use client";

import { useState, useEffect } from "react";
import { DataTable, type Column } from "@/components/admin/DataTable";

type Application = {
  id: string;
  name: string;
  email: string;
  applicationText: string;
  status: string;
};

const columns: Column<Application>[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "applicationText", label: "Application", render: (r) => <span className="line-clamp-2 max-w-xs text-slate-600">{r.applicationText}</span> },
  { key: "status", label: "Status", render: (r) => <span className={r.status === "pending" ? "text-amber-600" : r.status === "approved" ? "text-emerald-600" : "text-slate-500"}>{r.status}</span> },
];

export function AdminTrainersClient() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/trainers")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setApps(data.applications ?? []);
      })
      .catch(() => setError("Failed to load applications"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = (id: string, status: string) => {
    fetch("/api/admin/trainers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else load();
      });
  };

  if (loading && apps.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <p className="text-slate-500">Loading applications...</p>
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
      <DataTable
        columns={columns}
        data={apps}
        keyField="id"
        emptyMessage="No applications"
        actions={(row) => (
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setStatus(row.id, "approved")} className="rounded px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50">Approve</button>
            <button type="button" onClick={() => setStatus(row.id, "rejected")} className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Reject</button>
          </div>
        )}
      />
    </>
  );
}
