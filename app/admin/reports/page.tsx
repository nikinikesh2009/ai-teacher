import { AdminReportsClient } from "./AdminReportsClient";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Reports
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Moderation and user reports
        </p>
      </div>
      <AdminReportsClient />
    </div>
  );
}
