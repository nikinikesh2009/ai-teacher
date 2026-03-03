"use client";

const TOOL_BUTTONS = [
  { id: "settings", emoji: "⚙" },
  { id: "student", emoji: "👤" },
  { id: "resources", emoji: "📚" },
  { id: "analytics", emoji: "📊" },
  { id: "pins", emoji: "📌" },
  { id: "help", emoji: "❓" },
  { id: "notes", emoji: "📝" },
  { id: "view", emoji: "👁" },
];

export default function RightToolbar({
  activePanel,
  onPanelChange,
}: {
  activePanel: string | null;
  onPanelChange: (panel: string | null) => void;
}) {
  return (
    <aside
      className="w-[70px] flex-shrink-0 bg-[#E2E8F0] flex flex-col items-center py-2 gap-1"
      style={{ transition: "var(--transition-fast)" }}
    >
      {TOOL_BUTTONS.map(({ id, emoji }) => {
        const isActive = activePanel === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onPanelChange(isActive ? null : id)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg text-lg transition-colors duration-200 ${
              isActive
                ? "bg-[var(--color-surface)] shadow-sm text-[var(--color-text-main)]"
                : "hover:bg-white/70 text-[var(--color-text-sub)]"
            }`}
          >
            {emoji}
          </button>
        );
      })}
    </aside>
  );
}
