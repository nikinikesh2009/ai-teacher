import { AdminLicensesClient } from "./AdminLicensesClient";

export default function AdminLicensesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Licenses
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage user licenses and plans
        </p>
      </div>
      <AdminLicensesClient />
    </div>
  );
}
