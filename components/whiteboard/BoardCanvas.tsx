export default function BoardCanvas() {
  return (
    <div className="flex-1 min-w-0 p-4 flex items-center justify-center">
      <div
        className="w-full h-full rounded-[12px] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] flex items-center justify-center"
        style={{ transition: "var(--transition-fast)" }}
      >
        <span className="text-sm text-[var(--color-text-sub)]">
          Whiteboard Area
        </span>
      </div>
    </div>
  );
}
