import { AdminTrainersClient } from "./AdminTrainersClient";

export default function AdminTrainersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          AI Trainers
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Applications to help train the AI
        </p>
      </div>
      <AdminTrainersClient />
    </div>
  );
}
