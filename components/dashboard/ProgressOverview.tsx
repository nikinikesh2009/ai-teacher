import { StatCard } from "./StatCard";

type ProgressOverviewProps = {
  lessonsCompleted: number;
  flashcardsMastered: number;
  studyTimeThisWeek: string;
  learningStreakDays: number;
};

export function ProgressOverview({
  lessonsCompleted,
  flashcardsMastered,
  studyTimeThisWeek,
  learningStreakDays,
}: ProgressOverviewProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-900">Progress Overview</h2>
        <button
          type="button"
          className="text-xs font-medium text-blue-700 hover:text-blue-800"
        >
          View details
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Track how your learning is progressing over time.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          label="Lessons Completed"
          value={String(lessonsCompleted)}
          helper="Across all subjects"
        />
        <StatCard
          label="Flashcards Mastered"
          value={String(flashcardsMastered)}
          helper="Out of all flashcards"
        />
        <StatCard
          label="Study Time This Week"
          value={studyTimeThisWeek}
          helper="Based on your recent activity"
        />
        <StatCard
          label="Learning Streak"
          value={`${learningStreakDays} day${learningStreakDays === 1 ? "" : "s"}`}
          helper="Days with learning activity"
        />
      </div>

      <div className="mt-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-500">
        <p className="font-medium text-gray-700">Progress chart coming soon</p>
        <p className="mt-1">
          This area will visualize your study time, completed lessons, and streaks.
        </p>
      </div>
    </section>
  );
}


