"use client";

import { useState } from "react";
import type { ReactNode } from "react";

type HandlerKey = "onBack" | "onReplay" | "onDiscuss" | "onNotes" | "onTag" | "onPause" | "onNext";

interface BottomControlsProps {
  visible?: boolean;
  onToggle?: () => void;
  onBack?: () => void;
  onReplay?: () => void;
  onDiscuss?: () => void;
  discussionMode?: boolean;
  onNotes?: () => void;
  onTag?: () => void;
  onPause?: () => void;
  onNext?: () => void;
  currentStep?: number;
  stepsCount?: number;
}

const ICONS: Record<string, ReactNode> = {
  back: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  replay: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  ),
  discuss: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  notes: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8z" />
      <path d="M15 3v4a2 2 0 0 0 2 2h4" />
      <path d="M8 13h4" />
      <path d="M8 17h8" />
    </svg>
  ),
  tag: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z" />
      <circle cx="7" cy="7" r="1.5" />
    </svg>
  ),
  pause: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  ),
  play: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  next: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
};

const LEFT_BUTTONS: { id: HandlerKey; iconKey: string; label: string }[] = [
  { id: "onBack", iconKey: "back", label: "Back" },
  { id: "onReplay", iconKey: "replay", label: "Replay" },
  { id: "onDiscuss", iconKey: "discuss", label: "Discuss" },
];

const RIGHT_BUTTONS: { id: HandlerKey; iconKey: string; label: string }[] = [
  { id: "onNotes", iconKey: "notes", label: "Notes" },
  { id: "onTag", iconKey: "tag", label: "Tag" },
  { id: "onNext", iconKey: "next", label: "Next" },
];

export default function BottomControls({
  visible = true,
  onToggle,
  onBack,
  onReplay,
  onDiscuss,
  discussionMode = false,
  onNotes,
  onTag,
  onPause,
  onNext,
  currentStep = 0,
  stepsCount = 1,
}: BottomControlsProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isBursting, setIsBursting] = useState(false);
  const handlers = { onBack, onReplay, onDiscuss, onNotes, onTag, onPause, onNext };
  const canGoBack = stepsCount > 0 && currentStep > 0;
  const canGoNext = stepsCount > 0 && currentStep < stepsCount - 1;

  const handlePause = () => {
    setIsPaused((v) => !v);
    setIsBursting(true);
    onPause?.();
    setTimeout(() => setIsBursting(false), 400);
  };

  const renderButton = (
    id: HandlerKey,
    iconKey: string,
    label: string,
    isDiscuss = false,
    disabled = false,
  ) => {
    const disabledStyles = "disabled:opacity-45 disabled:pointer-events-none disabled:cursor-not-allowed";
    if (isDiscuss) {
      return (
        <button
          key={id}
          type="button"
          onClick={() => !disabled && handlers[id]?.()}
          title={label}
          disabled={disabled}
          className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full active:scale-95 shadow-md hover:shadow-lg active:shadow-sm transition-all duration-300 ease-out [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-[18px] sm:[&>svg]:h-[18px] ${disabledStyles} ${
            discussionMode
              ? "bg-green-500 text-white hover:bg-green-600"
              : "text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-600"
          }`}
        >
          {ICONS[iconKey]}
        </button>
      );
    }
    return (
      <button
        key={id}
        type="button"
        onClick={() => !disabled && handlers[id]?.()}
        title={label}
        disabled={disabled}
        className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-blue-600 bg-blue-50/80 hover:bg-blue-100 hover:text-blue-700 active:scale-95 shadow-md hover:shadow-lg active:shadow-sm transition-all duration-300 ease-out [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-[18px] sm:[&>svg]:h-[18px] ${disabledStyles}`}
      >
        {ICONS[iconKey]}
      </button>
    );
  };

  const bottomPadding = "pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] sm:pb-4";

  if (!visible) {
    return (
      <div className={`absolute inset-x-0 bottom-0 z-10 flex justify-center ${bottomPadding} px-2 sm:px-4 md:px-6`}>
        <button
          type="button"
          onClick={onToggle}
          title="Show controls"
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 bg-white/60 backdrop-blur-xl shadow-md hover:shadow-lg text-[var(--color-text-sub)] hover:text-[var(--color-text-main)] transition-all duration-300 animate-[slideInUp_0.3s_ease-out_forwards]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 15l-6-6-6 6" />
          </svg>
          <span className="text-sm font-medium">Show controls</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`absolute inset-x-0 bottom-0 z-10 flex flex-col items-center ${bottomPadding} px-3 sm:px-6`}>
      <nav className="flex items-center justify-evenly w-full max-w-[min(576px,92vw)] px-3 py-2.5 sm:px-6 sm:py-3 rounded-full border border-white/30 bg-white/60 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.08)] animate-[slideInUp_0.3s_ease-out_forwards]">
        {LEFT_BUTTONS.map(({ id, iconKey, label }) =>
          renderButton(id, iconKey, label, id === "onDiscuss", id === "onBack" ? !canGoBack : false),
        )}
        <button
          type="button"
          onClick={handlePause}
          title={isPaused ? "Play" : "Pause"}
          className={`relative overflow-visible w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center rounded-full text-white shadow-lg hover:shadow-xl active:scale-95 transition-all duration-300 ease-out [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-[18px] sm:[&>svg]:h-[18px] ${
            isPaused
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {isBursting && (
            <span
              className="absolute inset-0 rounded-full animate-[burst_0.4s_ease-out_forwards] pointer-events-none"
              style={{
                background: isPaused
                  ? "radial-gradient(circle, rgba(239,68,68,0.6) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(34,197,94,0.6) 0%, transparent 70%)",
              }}
            />
          )}
          <span className="relative z-10">{isPaused ? ICONS.play : ICONS.pause}</span>
        </button>
        {RIGHT_BUTTONS.map(({ id, iconKey, label }) =>
          renderButton(id, iconKey, label, false, id === "onNext" ? !canGoNext : false),
        )}
      </nav>
      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          title="Hide controls"
          className="mt-2 w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-text-sub)] hover:bg-white/60 hover:text-[var(--color-text-main)] transition-all duration-300 animate-[fadeInUp_0.25s_ease-out_forwards]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}
