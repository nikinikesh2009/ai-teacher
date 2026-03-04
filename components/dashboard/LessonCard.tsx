type LessonCardProps = {
  title: string;
  progressPercent: number;
  lastStudied: string;
};

export function LessonCard({ title, progressPercent, lastStudied }: LessonCardProps) {
  const clampedProgress = Math.max(0, Math.min(100, progressPercent));

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500">Last studied {lastStudied}</p>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span className="font-medium text-gray-800">{clampedProgress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
              style={{ width: `${clampedProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">
          Lesson
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <span>Resume Lesson</span>
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </article>
  );
}

