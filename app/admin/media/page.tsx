import { AdminMediaPageClient } from "./AdminMediaPageClient";

export default function AdminMediaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Media Library
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage YouTube videos, channels, and external resources
        </p>
      </div>
      <AdminMediaPageClient />
    </div>
  );
}
