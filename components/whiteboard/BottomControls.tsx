"use client";

const BUTTONS = [
  { id: "prev", emoji: "⬅" },
  { id: "play", emoji: "▶" },
  { id: "reset", emoji: "🔁" },
  { id: "help", emoji: "❓" },
  { id: "notes", emoji: "📝" },
  { id: "tags", emoji: "🏷" },
];

export default function BottomControls() {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
      <div
        className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-soft)]"
        style={{ transition: "var(--transition-fast)" }}
      >
        {BUTTONS.map(({ id, emoji }) => (
          <button
            key={id}
            type="button"
            onClick={() => console.log(`BottomControls: ${id}`)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-lg hover:bg-[var(--color-border)]/50 transition-colors duration-200"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
