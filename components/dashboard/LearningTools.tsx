import { ToolCard } from "./ToolCard";

type LearningToolsProps = {
  // Placeholder for future props
};

export function LearningTools(_: LearningToolsProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-900">Learning Tools</h2>
      </div>
      <p className="text-xs text-gray-500">
        Use quick tools to reinforce what you&apos;re learning.
      </p>

      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <ToolCard
          icon={
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M7 8h10" />
              <path d="M7 12h6" />
            </svg>
          }
          title="Flashcards"
          description="Review concepts from your lessons."
        />

        <ToolCard
          icon={
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5V4.5A2.5 2.5 0 0 1 6.5 2h11" />
              <path d="M8 18h5" />
              <path d="M8 14h8" />
              <path d="M8 10h8" />
              <path d="M19.5 22H6.5A2.5 2.5 0 0 1 4 19.5" />
              <path d="M16 2v4h4" />
            </svg>
          }
          title="Notes"
          description="View and organize your study notes."
        />

        <ToolCard
          icon={
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5V5.5A2.5 2.5 0 0 1 6.5 3H18" />
              <path d="M6 17h7" />
              <path d="M6 13h9" />
              <path d="M6 9h5" />
              <path d="M19.5 21H8.5A2.5 2.5 0 0 1 6 18.5" />
            </svg>
          }
          title="Saved Lessons"
          description="Access lessons you&apos;ve completed."
        />

        <ToolCard
          icon={
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M15.5 8.5 11 13l-2-2" />
            </svg>
          }
          title="Practice Exams"
          description="Test your understanding."
        />
      </div>
    </section>
  );
}

