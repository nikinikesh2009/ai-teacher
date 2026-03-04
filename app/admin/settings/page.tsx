import { AdminSettingsClient } from "./AdminSettingsClient";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Platform configuration
        </p>
      </div>
      <AdminSettingsClient />
    </div>
  );
}
