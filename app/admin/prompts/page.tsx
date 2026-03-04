import { AdminPromptsPageClient } from "./AdminPromptsPageClient";

export default function AdminPromptsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          AI Prompts
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage AI prompt templates
        </p>
      </div>
      <AdminPromptsPageClient />
    </div>
  );
}
