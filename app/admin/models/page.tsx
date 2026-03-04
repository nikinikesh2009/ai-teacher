import { AdminModelsClient } from "./AdminModelsClient";

export default function AdminModelsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          AI Models
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure AI model versions (API keys are never shown)
        </p>
      </div>
      <AdminModelsClient />
    </div>
  );
}
