"use client";

import Link from "next/link";

export default function TopBar({
  onToolbarToggle,
  toolbarOpen,
}: {
  onToolbarToggle: () => void;
  toolbarOpen: boolean;
}) {
  return (
    <header className="h-[clamp(3rem,8vh,60px)] flex-shrink-0 flex items-center justify-between px-3 sm:px-4 md:px-6 gap-2 bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 sm:gap-2 text-[13px] sm:text-[15px] font-medium text-[var(--color-text-sub)] hover:text-[var(--color-text-main)] transition-colors min-w-0"
      >
        <svg className="flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span className="hidden sm:inline">Back to Dashboard</span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 justify-center">
        <span className="text-[13px] sm:text-[15px] font-semibold text-[var(--color-text-main)] truncate">
          Lesson Title
        </span>
        <span className="flex-shrink-0 px-2 py-0.5 text-[12px] sm:text-[13px] font-medium text-[var(--color-text-sub)] bg-[var(--color-border)]/50 rounded-md">
          Step 1 / 5
        </span>
      </div>

      <button
        type="button"
        onClick={onToolbarToggle}
        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-[13px] sm:text-[14px] font-medium rounded-lg border flex-shrink-0 transition-colors ${
          toolbarOpen
            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
            : "border-[var(--color-border)] text-[var(--color-text-sub)] hover:bg-[var(--color-border)]/40 hover:text-[var(--color-text-main)]"
        }`}
      >
        <svg className="w-4 h-4 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
        <span className="hidden sm:inline">Toolkit</span>
      </button>
    </header>
  );
}
