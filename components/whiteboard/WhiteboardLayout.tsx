"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import BoardCanvas from "./BoardCanvas";
import BottomControls from "./BottomControls";
import RightToolbar from "@/components/toolbar/RightToolbar";
import SlidePanel from "./SlidePanel";
import DiscussionPanel from "./DiscussionPanel";
import { useNarration } from "@/lib/useNarration";
import type { LessonStep } from "@/lib/demoLesson";
import type { BoardElement } from "@/lib/boardTypes";

type Lesson = {
  title: string;
  steps: LessonStep[];
  slug?: string;
};

async function startLesson(topic: string): Promise<Lesson> {
  const res = await fetch("/api/generate-lesson", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error ?? `Failed to generate lesson (${res.status})`);
  }
  return res.json();
}

async function loadLessonBySlug(slug: string): Promise<Lesson> {
  const res = await fetch(`/api/lesson/${encodeURIComponent(slug)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error ?? `Failed to load lesson (${res.status})`);
  }
  return res.json();
}

interface WhiteboardLayoutProps {
  slug?: string | null;
}

export default function WhiteboardLayout({ slug: slugProp }: WhiteboardLayoutProps = {}) {
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [toolbarOpen, setToolbarOpen] = useState(true);
  const [bottomControlsVisible, setBottomControlsVisible] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [discussionMode, setDiscussionMode] = useState(false);
  const [paused, setPaused] = useState(false);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSlug, setLoadingSlug] = useState(!!slugProp);
  const [error, setError] = useState<string | null>(null);
  const [topicInput, setTopicInput] = useState("");
  const [generationStepIndex, setGenerationStepIndex] = useState(0);
  const [currentSlug, setCurrentSlug] = useState<string | null>(slugProp ?? null);
  const [panelSettings, setPanelSettings] = useState({
    subtitles: true,
    autoAdvance: false,
    highContrast: false,
  });

  const generationSteps = [
    { label: "Planning the lesson (teacher-style)", detail: "Structuring objectives and flow" },
    { label: "Choosing AI teaching personality", detail: "1 of 10 personalities matched to your topic" },
    { label: "Finding YouTube explanations", detail: "Fetching supporting videos" },
    { label: "Preparing whiteboard steps", detail: "Building diagrams and narration" },
    { label: "Setting lesson duration", detail: "10–60 min based on content depth" },
  ];
  const [discussionElements, setDiscussionElements] = useState<BoardElement[]>([]);
  const [discussionMessages, setDiscussionMessages] = useState<
    Array<{ role: "student" | "teacher"; content: string }>
  >([]);

  const { speak, stop } = useNarration();

  useEffect(() => {
    if (!slugProp?.trim()) return;
    let cancelled = false;
    setLoadingSlug(true);
    setError(null);
    loadLessonBySlug(slugProp)
      .then((data) => {
        if (!cancelled) {
          setLesson(data);
          setCurrentSlug(data.slug ?? slugProp);
          setCurrentStep(0);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load lesson");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSlug(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slugProp]);

  const title = lesson?.title ?? "Lesson";
  const steps = lesson?.steps ?? [];
  const step = steps[currentStep];
  const stepsCount = steps.length;

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, stepsCount - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const [lastSpokenStep, setLastSpokenStep] = useState<number | null>(null);

  // Auto-play narration when the step changes, but do NOT restart it on pause/resume.
  useEffect(() => {
    if (discussionMode) {
      stop();
      return;
    }
    if (!step?.narration || paused) return;
    if (lastSpokenStep !== currentStep) {
      speak(step.narration);
      setLastSpokenStep(currentStep);
    }
  }, [currentStep, discussionMode, paused, step?.narration, speak, stop, lastSpokenStep]);

  useEffect(() => {
    if (!panelSettings.autoAdvance || paused || discussionMode) return;
    if (!step?.narration || stepsCount === 0) return;

    const words = step.narration.split(/\s+/).filter(Boolean).length;
    const durationMs = Math.min(Math.max(words * 350, 4000), 20000);
    const targetStepIndex = currentStep;

    const timeout = window.setTimeout(() => {
      setCurrentStep((prev) => {
        if (prev !== targetStepIndex) return prev;
        return Math.min(prev + 1, stepsCount - 1);
      });
    }, durationMs);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    panelSettings.autoAdvance,
    paused,
    discussionMode,
    step?.narration,
    currentStep,
    stepsCount,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target as HTMLElement & { isContentEditable?: boolean })?.isContentEditable
      )
        return;
      if (e.key === "ArrowLeft") {
        handleBack();
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        handleNext();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stepsCount]);

  const handleDiscussToggle = () => {
    setDiscussionMode((v) => !v);
  };

  const handleDiscussionClose = () => {
    setDiscussionMode(false);
    setDiscussionElements([]);
    setDiscussionMessages([]);
  };

  const handleDiscussionSend = async (message: string) => {
    setDiscussionMessages((prev) => [...prev, { role: "student", content: message }]);
    const res = await fetch("/api/discuss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        stepContext: step?.narration,
        lessonTitle: title,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setDiscussionMessages((prev) => prev.slice(0, -1));
      throw new Error(data?.error ?? `Discussion failed (${res.status})`);
    }
    const data = (await res.json()) as { speech?: string; draw?: BoardElement[] };
    if (data.speech) {
      speak(data.speech);
      setDiscussionMessages((prev) => [...prev, { role: "teacher", content: data.speech! }]);
    }
    if (data.draw?.length) setDiscussionElements((prev) => [...prev, ...data.draw!]);
  };

  const handlePauseToggle = () => {
    setPaused((prev) => {
      const next = !prev;

      // Stop any current narration before speaking the cue.
      stop();

      const pausePhrases = [
        "Let's take a quick pause here.",
        "We’ll pause for a moment so you can process this.",
        "Alright, pausing the lesson for a bit.",
      ];

      const resumePhrases = [
        "So, let’s continue from where we left off.",
        "Alright, picking up the lesson from here.",
        "Great, let’s carry on with the lesson.",
      ];

      if (next) {
        const phrase = pausePhrases[Math.floor(Math.random() * pausePhrases.length)];
        speak(phrase);
      } else {
        const phrase = resumePhrases[Math.floor(Math.random() * resumePhrases.length)];
        // When resuming, say a cue and immediately continue teaching this step.
        if (step?.narration) {
          speak(`${phrase} ${step.narration}`);
        } else {
          speak(phrase);
        }
      }

      return next;
    });
  };

  const handleStartLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    const topic = topicInput.trim();
    if (!topic) return;
    setLoading(true);
    setError(null);
    setGenerationStepIndex(0);

    const stepInterval = setInterval(() => {
      setGenerationStepIndex((prev) =>
        prev < generationSteps.length - 1 ? prev + 1 : prev
      );
    }, 1600);

    try {
      const result = await startLesson(topic);
      clearInterval(stepInterval);
      setGenerationStepIndex(generationSteps.length - 1);
      setLesson(result);
      setCurrentSlug(result.slug ?? null);
      setCurrentStep(0);
      if (result.slug) {
        router.replace(`/board/${result.slug}`);
      }
    } catch (err) {
      clearInterval(stepInterval);
      setError(err instanceof Error ? err.message : "Failed to generate lesson");
    } finally {
      setLoading(false);
    }
  };

  const handleNewLesson = () => {
    setLesson(null);
    setCurrentStep(0);
    setCurrentSlug(null);
    setError(null);
    setTopicInput("");
    stop();
    router.push("/board");
  };

  if (!lesson) {
    return (
      <div className="flex flex-col overflow-hidden w-full min-w-0 min-h-0 fixed inset-0 z-50 bg-[#fdfcf8] h-[100dvh]">
        <header className="flex-shrink-0 z-10">
          <TopBar
            toolbarOpen={false}
            title={slugProp ? "Lesson" : "New Lesson"}
            onToolbarToggle={() => {}}
          />
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-soft)]">
            {loadingSlug ? (
              <div className="py-8 text-center">
                <p className="text-[var(--color-text-main)] font-medium">Loading lesson…</p>
                <p className="mt-2 text-sm text-[var(--color-text-sub)]">/{slugProp}</p>
              </div>
            ) : slugProp && error ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[var(--color-text-main)]">Lesson not found</h2>
                <p className="text-sm text-[var(--color-text-sub)]">/{slugProp}</p>
                <p className="text-sm text-red-600">{error}</p>
                <button
                  type="button"
                  onClick={() => router.push("/board")}
                  className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-3 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
                >
                  Start a new lesson
                </button>
              </div>
            ) : !loading ? (
              <>
                <h2 className="text-xl font-semibold text-[var(--color-text-main)]">
                  Start a lesson
                </h2>
                <p className="mt-2 text-sm text-[var(--color-text-sub)]">
                  Enter a topic and AI will generate a structured lesson with
                  diagrams and narration.
                </p>
                <form onSubmit={handleStartLesson} className="mt-6 space-y-4">
                  <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="e.g. Introduction to vectors"
                    disabled={loading}
                    className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-[var(--color-text-main)] placeholder:text-[var(--color-text-sub)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    autoFocus
                  />
                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading || !topicInput.trim()}
                    className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-3 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    Generate lesson
                  </button>
                </form>
              </>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-[var(--color-text-main)]">
                  Creating your lesson
                </h2>
                <p className="text-sm text-[var(--color-text-sub)]">
                  Topic: <span className="font-medium text-[var(--color-text-main)]">{topicInput.trim()}</span>
                </p>
                <div className="space-y-3">
                  {generationSteps.map((s, i) => {
                    const isActive = i === generationStepIndex;
                    const isDone = i < generationStepIndex;
                    return (
                      <div
                        key={i}
                        className={`flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
                          isActive
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                            : isDone
                              ? "border-[var(--color-border)] bg-[var(--color-surface)] opacity-80"
                              : "border-[var(--color-border)] bg-[var(--color-surface)]/50"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                            isActive
                              ? "bg-[var(--color-primary)] text-white"
                              : isDone
                                ? "bg-green-500/20 text-green-700 dark:text-green-400"
                                : "bg-[var(--color-border)] text-[var(--color-text-sub)]"
                          }`}
                        >
                          {isDone ? "✓" : i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium ${isActive ? "text-[var(--color-text-main)]" : "text-[var(--color-text-sub)]"}`}>
                            {s.label}
                          </p>
                          <p className="mt-0.5 text-xs text-[var(--color-text-sub)]">
                            {s.detail}
                          </p>
                        </div>
                        {isActive && (
                          <span className="flex h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-[var(--color-primary)]" />
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-center text-xs text-[var(--color-text-sub)]">
                  Lesson duration will be 10–60 minutes depending on content.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden w-full min-w-0 min-h-0 fixed inset-0 z-50 bg-[#fdfcf8] h-[100dvh]">
      {!fullscreen && bottomControlsVisible && (
        <header className="flex-shrink-0 z-10">
          <TopBar
            toolbarOpen={toolbarOpen}
            title={title}
            stepIndicator={`Step ${currentStep + 1} / ${stepsCount}`}
            onToolbarToggle={() => {
              setToolbarOpen((v) => {
                if (!v) setBottomControlsVisible(false);
                return !v;
              });
            }}
            onNewLesson={handleNewLesson}
          />
        </header>
      )}

      <div
        className={`relative flex flex-1 min-h-0 min-w-0 overflow-hidden transition-all duration-300 ${
          fullscreen
            ? "flex flex-col"
            : bottomControlsVisible
              ? "pt-2 pb-[clamp(4rem,12vh,7rem)]"
              : "pt-4 pb-4"
        }`}
      >
        <BoardCanvas
          step={step}
          fullscreen={fullscreen}
          toggleFullscreen={() => setFullscreen((v) => !v)}
          onNext={handleNext}
          onBack={handleBack}
          currentStep={currentStep}
          stepsCount={stepsCount}
          controlsVisible={bottomControlsVisible}
          discussionElements={discussionElements}
          showSubtitles={panelSettings.subtitles}
          highContrast={panelSettings.highContrast}
        />
        {!fullscreen && toolbarOpen && (
          <RightToolbar
            activePanel={activePanel}
            onPanelChange={setActivePanel}
            topBarVisible={bottomControlsVisible}
          />
        )}
      </div>

      {!fullscreen && (
        <BottomControls
          visible={bottomControlsVisible}
          onToggle={() => {
            const willShow = !bottomControlsVisible;
            setBottomControlsVisible((v) => !v);
            if (willShow) setToolbarOpen(false);
          }}
          onBack={handleBack}
          onReplay={() => speak(step?.narration ?? "")}
          onDiscuss={handleDiscussToggle}
          discussionMode={discussionMode}
          onPause={handlePauseToggle}
          onNext={handleNext}
          currentStep={currentStep}
          stepsCount={stepsCount}
        />
      )}

      <DiscussionPanel
        isOpen={discussionMode}
        onClose={handleDiscussionClose}
        onSendMessage={handleDiscussionSend}
        messages={discussionMessages}
        discussionElements={discussionElements}
      />

      <SlidePanel
        activePanel={activePanel}
        onClose={() => setActivePanel(null)}
        onOverlayClick={() => setActivePanel(null)}
        lessonTitle={title}
        steps={steps}
        currentStepIndex={currentStep}
        settings={panelSettings}
        onSettingsChange={setPanelSettings}
      />
    </div>
  );
}
