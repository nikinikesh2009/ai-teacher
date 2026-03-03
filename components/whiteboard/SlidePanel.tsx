"use client";

const PANEL_LABELS: Record<string, string> = {
  settings: "Settings",
  tutor: "Tutor",
  flashcards: "Flashcards",
  flowchart: "Flowchart",
  keypoints: "Key Points",
  help: "Help",
  exam: "Exam",
  hide: "Hide Panel",
};

export default function SlidePanel({
  activePanel,
  onClose,
  onOverlayClick,
}: {
  activePanel: string | null;
  onClose: () => void;
  onOverlayClick: () => void;
}) {
  const isOpen = activePanel !== null;

  return (
    <>
      <div
        onClick={onOverlayClick}
        className={`fixed inset-0 bg-black/30 z-20 transition-opacity duration-[250ms] ease-in-out ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed top-0 right-0 h-full w-[320px] bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-[var(--shadow-soft)] z-30 flex flex-col transition-transform duration-[250ms] ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <h2 className="text-base font-semibold text-[var(--color-text-main)]">
            {activePanel ? PANEL_LABELS[activePanel] ?? "Panel" : ""}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-[var(--color-text-sub)] hover:bg-[var(--color-border)]/50 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 p-4 overflow-auto">
          <p className="text-sm text-[var(--color-text-sub)]">
            {activePanel
              ? `Content placeholder for ${PANEL_LABELS[activePanel] ?? activePanel} panel.`
              : ""}
          </p>
        </div>
      </aside>
    </>
  );
}
