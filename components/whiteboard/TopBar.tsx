export default function TopBar({
  isPaused,
  onPauseToggle,
}: {
  isPaused: boolean;
  onPauseToggle: () => void;
}) {
  return (
    <header
      className="h-[60px] flex-shrink-0 flex items-center justify-between px-4 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
      style={{ transition: "var(--transition-fast)" }}
    >
      <button
        type="button"
        className="text-sm font-medium text-[var(--color-text-sub)] hover:text-[var(--color-text-main)] transition-colors duration-200"
      >
        Exit
      </button>

      <h1 className="text-base font-semibold tracking-tight text-[var(--color-text-main)]">
        Lesson Title
      </h1>

      <button
        type="button"
        onClick={onPauseToggle}
        className="px-3 py-1.5 text-sm font-medium rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-sub)] hover:bg-[var(--color-border)]/50 transition-colors duration-200"
      >
        {isPaused ? "Resume" : "Paused"}
      </button>
    </header>
  );
}
