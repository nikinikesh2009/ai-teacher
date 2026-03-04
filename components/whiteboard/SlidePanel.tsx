"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { LessonStep } from "@/lib/demoLesson";

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

type PanelSettings = {
  subtitles: boolean;
  autoAdvance: boolean;
  highContrast: boolean;
};

function SettingsPanel({
  settings,
  onChange,
}: {
  settings: PanelSettings;
  onChange: (next: PanelSettings) => void;
}) {
  const { subtitles, autoAdvance, highContrast } = settings;

  return (
    <div className="space-y-4 text-sm">
      <p className="text-[var(--color-text-sub)]">
        Personalise how this lesson feels. These settings are local to your browser.
      </p>
      <div className="space-y-3">
        <label className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
          <div>
            <span className="font-medium text-[var(--color-text-main)]">
              Show subtitles
            </span>
            <p className="text-xs text-[var(--color-text-sub)]">
              Always show the narration text under the board.
            </p>
          </div>
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={subtitles}
            onChange={(e) =>
              onChange({ ...settings, subtitles: e.target.checked })
            }
          />
        </label>
        <label className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
          <div>
            <span className="font-medium text-[var(--color-text-main)]">
              Auto-advance steps
            </span>
            <p className="text-xs text-[var(--color-text-sub)]">
              Move to the next step automatically after narration finishes.
            </p>
          </div>
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={autoAdvance}
            onChange={(e) =>
              onChange({ ...settings, autoAdvance: e.target.checked })
            }
          />
        </label>
        <label className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
          <div>
            <span className="font-medium text-[var(--color-text-main)]">
              High-contrast mode
            </span>
            <p className="text-xs text-[var(--color-text-sub)]">
              Increase contrast for better readability.
            </p>
          </div>
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={highContrast}
            onChange={(e) =>
              onChange({ ...settings, highContrast: e.target.checked })
            }
          />
        </label>
      </div>
    </div>
  );
}

interface SlidePanelProps {
  activePanel: string | null;
  onClose: () => void;
  onOverlayClick: () => void;
  lessonTitle?: string;
  steps?: LessonStep[];
  currentStepIndex?: number;
  settings: PanelSettings;
  onSettingsChange: (next: PanelSettings) => void;
}

export default function SlidePanel({
  activePanel,
  onClose,
  onOverlayClick,
  lessonTitle,
  steps,
  currentStepIndex,
  settings,
  onSettingsChange,
}: SlidePanelProps) {
  const isOpen = activePanel !== null;

  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [panelWidth, setPanelWidth] = useState(320);

  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(320);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizingRef.current) return;
      const delta = startXRef.current - event.clientX;
      const nextWidth = Math.min(Math.max(startWidthRef.current + delta, 260), 480);
      setPanelWidth(nextWidth);
    };

    const handleMouseUp = () => {
      if (!isResizingRef.current) return;
      isResizingRef.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    setFlashcardIndex(0);
    setShowAnswer(false);
  }, [activePanel]);

  const currentStep =
    steps && typeof currentStepIndex === "number"
      ? steps[currentStepIndex] ?? null
      : null;

  const flashcards = useMemo(
    () =>
      (steps ?? []).map((step, index) => ({
        id: step.id ?? index,
        question: `What is the main idea of step ${index + 1}?`,
        answer: step.narration,
      })),
    [steps]
  );

  const hasFlashcards = flashcards.length > 0;
  const activeFlashcard = hasFlashcards ? flashcards[flashcardIndex] : null;

  const renderFlashcards = () => {
    if (!hasFlashcards) {
      return (
        <p className="text-sm text-[var(--color-text-sub)]">
          Flashcards will appear here once a lesson has been generated.
        </p>
      );
    }

    return (
      <div className="flex h-full flex-col">
        <div className="mb-4 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-[var(--color-text-sub)]">
          <span>
            {lessonTitle ?? "Lesson"} • Flashcard {flashcardIndex + 1} of{" "}
            {flashcards.length}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[var(--color-primary)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-primary)]" />
            Active recall
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowAnswer((prev) => !prev)}
          className="group relative flex-1 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] via-[var(--color-surface)] to-[var(--color-primary)]/5 px-4 py-6 text-left shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[var(--color-primary)]/60"
        >
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-40">
            <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[var(--color-primary)]/10 blur-2xl" />
            <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-[var(--color-primary)]/10 blur-2xl" />
          </div>
          <div className="relative">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-sub)]">
                {showAnswer ? "Answer" : "Question"}
              </p>
              <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-primary)] group-hover:translate-x-0.5 group-hover:scale-105 transition-transform">
                Tap to flip
              </span>
            </div>
            <div className="mt-3 space-y-1 text-sm text-[var(--color-text-main)] whitespace-pre-wrap">
              <p
                className={`transition-opacity duration-200 ${
                  showAnswer ? "opacity-0 absolute" : "opacity-100 relative"
                }`}
              >
                {activeFlashcard?.question}
              </p>
              <p
                className={`transition-opacity duration-200 ${
                  showAnswer ? "opacity-100 relative" : "opacity-0 absolute"
                }`}
              >
                {activeFlashcard?.answer}
              </p>
            </div>
            <p className="mt-4 text-xs text-[var(--color-text-sub)]">
              {showAnswer
                ? "Try explaining this out loud without looking, then flip back."
                : "First, guess the answer in your head, then flip the card."}
            </p>
          </div>
        </button>
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setFlashcardIndex((prev) =>
                prev === 0 ? flashcards.length - 1 : prev - 1
              );
              setShowAnswer(false);
            }}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-main)] hover:bg-[var(--color-border)]/30"
          >
            Previous
          </button>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-sub)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
            <span>
              Card {flashcardIndex + 1} of {flashcards.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setFlashcardIndex((prev) =>
                prev === flashcards.length - 1 ? 0 : prev + 1
              );
              setShowAnswer(false);
            }}
            className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-primary-hover)]"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const renderFlowchart = () => {
    if (!steps?.length) {
      return (
        <p className="text-sm text-[var(--color-text-sub)]">
          When you start a lesson, a simple flow of steps will appear here.
        </p>
      );
    }

    return (
      <ol className="space-y-3 text-sm">
        {steps.map((step, index) => {
          const isCurrent = currentStep && step.id === currentStep.id;
          return (
            <li
              key={step.id ?? index}
              className={`relative rounded-lg border px-3 py-2 ${
                isCurrent
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                  : "border-[var(--color-border)] bg-[var(--color-surface)]"
              }`}
            >
              <div className="flex items-start gap-2">
                <span
                  className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isCurrent
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-border)] text-[var(--color-text-sub)]"
                  }`}
                >
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-[var(--color-text-main)]">
                    Step {index + 1}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-sub)] line-clamp-3">
                    {step.narration}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="absolute bottom-[-10px] left-6 h-5 w-px bg-[var(--color-border)]" />
              )}
            </li>
          );
        })}
      </ol>
    );
  };

  const renderKeypoints = () => {
    if (!steps?.length) {
      return (
        <p className="text-sm text-[var(--color-text-sub)]">
          Key points from this lesson will show here once a lesson is generated.
        </p>
      );
    }

    return (
      <div className="space-y-3 text-sm">
        <p className="text-[var(--color-text-sub)]">
          A quick list of bite-sized takeaways for revision.
        </p>
        <ul className="space-y-2">
          {steps.map((step, index) => (
            <li
              key={step.id ?? index}
              className="flex items-start gap-2 rounded-lg bg-[var(--color-surface)] px-3 py-2"
            >
              <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-primary)]" />
              <span className="text-[var(--color-text-main)]">
                {step.narration}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderHelp = (): ReactNode => (
    <div className="space-y-4 text-sm">
      <p className="text-[var(--color-text-sub)]">
        Need a quick orientation? Here&apos;s how to use this lesson board.
      </p>
      <ul className="space-y-2">
        <li>
          <span className="font-medium text-[var(--color-text-main)]">
            Navigate:
          </span>{" "}
          Use the arrow keys or the controls under the board to move between
          steps.
        </li>
        <li>
          <span className="font-medium text-[var(--color-text-main)]">
            Narration:
          </span>{" "}
          The AI reads each step aloud. You can pause, resume, or replay from
          the bottom controls.
        </li>
        <li>
          <span className="font-medium text-[var(--color-text-main)]">
            Discuss:
          </span>{" "}
          Open the discussion mode to ask questions and see extra board
          drawings.
        </li>
        <li>
          <span className="font-medium text-[var(--color-text-main)]">
            Tools:
          </span>{" "}
          The right-hand toolbar opens extra study tools like flashcards and
          key points.
        </li>
      </ul>
    </div>
  );

  const renderExam = (): ReactNode => {
    if (!steps?.length) {
      return (
        <p className="text-sm text-[var(--color-text-sub)]">
          Once you have a lesson, you&apos;ll see a few quick self-check
          questions here.
        </p>
      );
    }

    return (
      <div className="space-y-4 text-sm">
        <p className="text-[var(--color-text-sub)]">
          Use these quick questions to check your understanding. Answer in your
          own words.
        </p>
        <div className="space-y-3">
          {steps.slice(0, 4).map((step, index) => (
            <div
              key={step.id ?? index}
              className="space-y-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            >
              <p className="font-medium text-[var(--color-text-main)]">
                Question {index + 1}
              </p>
              <p className="text-xs text-[var(--color-text-sub)]">
                Based on this part of the lesson:
              </p>
              <p className="text-xs text-[var(--color-text-main)]">
                {step.narration}
              </p>
              <textarea
                rows={2}
                className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs text-[var(--color-text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                placeholder="Write your answer here…"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderHide = (): ReactNode => (
    <div className="space-y-3 text-sm">
      <p className="text-[var(--color-text-sub)]">
        This side panel is here when you need extra tools, and stays out of the
        way when you don&apos;t.
      </p>
      <p className="text-[var(--color-text-sub)]">
        To hide it for now, just close this panel with the ✕ button or tap
        anywhere on the dimmed area.
      </p>
    </div>
  );

  let body: ReactNode = null;

  if (activePanel === "settings")
    body = <SettingsPanel settings={settings} onChange={onSettingsChange} />;
  else if (activePanel === "flashcards") body = renderFlashcards();
  else if (activePanel === "flowchart") body = renderFlowchart();
  else if (activePanel === "keypoints") body = renderKeypoints();
  else if (activePanel === "help") body = renderHelp();
  else if (activePanel === "exam") body = renderExam();
  else if (activePanel === "hide") body = renderHide();

  return (
    <>
      <div
        onClick={onOverlayClick}
        className={`fixed inset-0 bg-black/30 z-20 transition-opacity duration-[250ms] ease-in-out ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed top-0 right-0 h-full bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-[var(--shadow-soft)] z-30 flex flex-col transition-transform duration-[250ms] ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: panelWidth }}
      >
        <div
          className="absolute left-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-[var(--color-border)]/40"
          onMouseDown={(event) => {
            isResizingRef.current = true;
            startXRef.current = event.clientX;
            startWidthRef.current = panelWidth;
          }}
        />
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
          {body ?? (
            <p className="text-sm text-[var(--color-text-sub)]">
              Choose a tool from the right-hand toolbar to get started.
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
