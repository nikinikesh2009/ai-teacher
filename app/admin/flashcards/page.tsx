import { AdminFlashcardsClient } from "./AdminFlashcardsClient";

export default function AdminFlashcardsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Flashcards
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View and edit flashcard sets
        </p>
      </div>
      <AdminFlashcardsClient />
    </div>
  );
}
