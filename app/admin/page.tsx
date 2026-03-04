import { AdminDashboardClient } from "./AdminDashboardClient";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Platform overview and key metrics
        </p>
      </div>
      <AdminDashboardClient />
    </div>
  );
}
