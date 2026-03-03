import Link from "next/link";

export default function Home() {
  return (
    <main className="py-16">
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 shadow-[var(--shadow-soft)]">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text-main)]">
            TutorFlow
          </h1>
          <p className="max-w-xl text-base text-[var(--color-text-sub)]">
            Foundation for a modern tutoring workflow platform. This is a clean,
            minimal starting point for building out TutorFlow&apos;s features.
          </p>
          <p className="flex gap-4 pt-2">
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
