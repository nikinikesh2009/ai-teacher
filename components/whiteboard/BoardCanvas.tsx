export default function BoardCanvas() {
  return (
    <div className="flex-1 min-w-0 min-h-0 flex p-2 sm:p-4 md:p-6">
      <div className="w-full h-full min-h-[min(200px,40dvh)] sm:min-h-[min(300px,50dvh)] rounded-lg sm:rounded-xl bg-[var(--color-surface)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center border border-[var(--color-border)]">
        <div className="w-14 h-14 rounded-full bg-[var(--color-border)]/60 flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-sub)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <span className="text-[15px] font-medium text-[var(--color-text-sub)] tracking-tight">
          Whiteboard Canvas Area
        </span>
        <span className="text-[13px] text-[var(--color-text-sub)]/70 mt-1">
          Content will appear here
        </span>
      </div>
    </div>
  );
}
