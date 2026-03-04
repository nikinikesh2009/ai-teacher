"use client";

import { useState, useEffect } from "react";
import { DataTable, type Column } from "@/components/admin/DataTable";

type License = {
  id: string;
  user: string;
  planType: string;
  startDate: string;
  expiryDate: string;
  status: string;
};

const columns: Column<License>[] = [
  { key: "id", label: "License ID", render: (r) => <span className="font-mono text-xs">{r.id.slice(0, 8)}…</span> },
  { key: "user", label: "User" },
  { key: "planType", label: "Plan type", render: (r) => <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">{r.planType}</span> },
  { key: "startDate", label: "Start date" },
  { key: "expiryDate", label: "Expiry date" },
  { key: "status", label: "Status", render: (r) => <span className={r.status === "active" ? "text-emerald-600" : "text-slate-500"}>{r.status}</span> },
];

export function AdminLicensesClient() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/licenses")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setLicenses(data.licenses ?? []);
      })
      .catch(() => setError("Failed to load licenses"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = (id: string, status: string) => {
    fetch("/api/admin/licenses", {
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

  if (loading && licenses.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <p className="text-slate-500">Loading licenses...</p>
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
        data={licenses}
        keyField="id"
        emptyMessage="No licenses"
        actions={(row) => (
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => updateStatus(row.id, "active")} className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100">Extend</button>
            <button type="button" onClick={() => updateStatus(row.id, "suspended")} className="rounded px-2 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50">Suspend</button>
            <button type="button" className="rounded px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50">Upgrade</button>
          </div>
        )}
      />
    </>
  );
}
