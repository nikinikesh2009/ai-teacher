import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="py-16">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-soft)]">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-main)]">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-sub)]">
          Placeholder for the TutorFlow tutor and student dashboard.
        </p>
        <Link
          href="/board"
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          Open Board
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </section>
    </main>
  );
}
