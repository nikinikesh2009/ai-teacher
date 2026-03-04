import { AdminAssetsPageClient } from "./AdminAssetsPageClient";

export default function AdminAssetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Whiteboard Assets
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Reusable diagrams for the AI whiteboard
        </p>
      </div>
      <AdminAssetsPageClient />
    </div>
  );
}
