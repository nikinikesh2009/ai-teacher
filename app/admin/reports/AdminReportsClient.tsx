"use client";

import { useState, useEffect } from "react";
import { DataTable, type Column } from "@/components/admin/DataTable";

type Report = {
  id: string;
  user: string;
  reason: string;
  status: string;
};

const columns: Column<Report>[] = [
  { key: "id", label: "Report ID", render: (r) => <span className="font-mono text-xs">{r.id.slice(0, 8)}…</span> },
  { key: "user", label: "User" },
  { key: "reason", label: "Reason" },
  { key: "status", label: "Status", render: (r) => <span className={r.status === "pending" ? "text-amber-600" : "text-slate-500"}>{r.status}</span> },
];

export function AdminReportsClient() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/reports")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setReports(data.reports ?? []);
      })
      .catch(() => setError("Failed to load reports"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = (id: string, status: string) => {
    fetch("/api/admin/reports", {
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

  if (loading && reports.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <p className="text-slate-500">Loading reports...</p>
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
        data={reports}
        keyField="id"
        emptyMessage="No reports"
        actions={(row) => (
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setStatus(row.id, "resolved")} className="rounded px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50">Resolve</button>
            <button type="button" onClick={() => setStatus(row.id, "dismissed")} className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100">Dismiss</button>
            <button type="button" className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Ban user</button>
          </div>
        )}
      />
    </>
  );
}
