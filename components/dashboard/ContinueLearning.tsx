import { LessonCard } from "./LessonCard";

export type ContinueLesson = {
  id: string;
  title: string;
  progressPercent: number;
  lastStudied: string;
};

type ContinueLearningProps = {
  lessons: ContinueLesson[];
};

export function ContinueLearning({ lessons }: ContinueLearningProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-900">Continue Learning</h2>
        <button
          type="button"
          className="text-xs font-medium text-blue-700 hover:text-blue-800"
        >
          View all
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Pick up where you left off in your recent lessons.
      </p>

      {lessons.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500">
          You don&apos;t have any in-progress lessons yet. Start a new lesson above to
          see it appear here.
        </div>
      ) : (
        <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              title={lesson.title}
              progressPercent={lesson.progressPercent}
              lastStudied={lesson.lastStudied}
            />
          ))}
        </div>
      )}
    </section>
  );
}


