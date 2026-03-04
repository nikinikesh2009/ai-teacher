import { AdminLessonsClient } from "./AdminLessonsClient";

export default function AdminLessonsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Lessons
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage AI-generated lessons and versions
        </p>
      </div>
      <AdminLessonsClient />
    </div>
  );
}
