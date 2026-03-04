"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Stage, Layer, Group, Text, Line, Rect, Arrow, Circle } from "react-konva";
import type { LessonStep } from "@/lib/demoLesson";
import type { BoardElement } from "@/lib/boardTypes";

const STROKE = "#2f2f2f";
const DISCUSSION_STROKE = "#444";
const BACKGROUND = "#fdfcf8";
const GRID_SPACING = 28;
const DOT_RADIUS = 1.2;
const DOT_FILL = "rgba(47, 47, 47, 0.25)";
const BOARD_SCALE = 1;

interface BoardCanvasProps {
  step: LessonStep | undefined;
  fullscreen: boolean;
  toggleFullscreen: () => void;
  onNext?: () => void;
  onBack?: () => void;
  currentStep: number;
  stepsCount: number;
  controlsVisible?: boolean;
  discussionElements?: BoardElement[];
  showSubtitles?: boolean;
  highContrast?: boolean;
}

export default function BoardCanvas({
  step,
  fullscreen,
  toggleFullscreen,
  onNext,
  onBack,
  currentStep,
  stepsCount,
  controlsVisible = true,
  discussionElements = [],
  showSubtitles = false,
  highContrast = false,
}: BoardCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 500 });
  const showFullscreenButton = fullscreen || controlsVisible;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      if (el) {
        const w = Math.floor(el.clientWidth) || 800;
        const h = Math.floor(el.clientHeight) || 500;
        setSize({ width: w, height: h });
      }
    };

    const handleResize = () => requestAnimationFrame(updateSize);

    updateSize();
    const ro = new ResizeObserver(handleResize);
    ro.observe(el);
    window.addEventListener("resize", handleResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const elements: BoardElement[] = step?.board ?? [];
  const discussionLayerElements = discussionElements;

  const boardWidth = size.width * BOARD_SCALE;
  const boardHeight = size.height * BOARD_SCALE;
  const contentOffsetX = size.width / 2 - 295;
  const contentOffsetY = size.height / 2 - 195;

  const dotPositions = useMemo(() => {
    const dots: { x: number; y: number }[] = [];
    for (let x = 0; x <= boardWidth; x += GRID_SPACING) {
      for (let y = 0; y <= boardHeight; y += GRID_SPACING) {
        dots.push({ x, y });
      }
    }
    return dots;
  }, [boardWidth, boardHeight]);

  const handleBoardDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const frac = x / rect.width;
    if (frac < 0.3) onBack?.();
    else if (frac > 0.7) onNext?.();
  };

  return (
    <div className="relative flex-1 min-w-0 min-h-0 flex flex-col bg-[#fdfcf8] pl-2 md:pl-[90px] pr-2 py-2">
      <div className="relative flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
        {showFullscreenButton && (
          <button
            type="button"
            onClick={toggleFullscreen}
            className="absolute top-0 right-0 z-10 px-3 py-2 rounded-md bg-gray-800 text-white text-sm font-medium shadow-sm hover:bg-gray-700 transition-colors"
          >
            {fullscreen ? "Exit" : "Fullscreen"}
          </button>
        )}

        {fullscreen && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-4 py-2 rounded-full bg-white/90 shadow-sm">
            <button
              type="button"
              onClick={onBack}
              disabled={currentStep <= 0}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              title="Back"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium text-gray-600 min-w-[4rem] text-center">
              Step {currentStep + 1} / {stepsCount}
            </span>
            <button
              type="button"
              onClick={onNext}
              disabled={currentStep >= stepsCount - 1}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              title="Next"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        <div className={`flex-1 min-h-0 flex items-center justify-center p-2 sm:p-3 overflow-hidden ${fullscreen ? "pb-14" : ""}`}>
          {step?.videoId ? (
            <div className="flex flex-col items-center gap-2 w-full max-w-[min(90vw, 560px)]">
              <p className="text-sm font-medium text-[var(--color-text-main)]">Watch video</p>
              <div className="w-full aspect-video rounded-2xl border-2 border-gray-200/90 shadow-xl overflow-hidden bg-gray-100 shrink-0">
                <iframe
                  src={`https://www.youtube.com/embed/${step.videoId}?rel=0`}
                  title="Lesson video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          ) : (
            <div
              ref={containerRef}
              role="region"
              aria-label="Lesson board - drag to pan, double-tap left for previous, right for next"
              onDoubleClick={handleBoardDoubleClick}
              className="rounded-2xl overflow-hidden box-border backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
              style={{
                background: "rgba(253, 252, 248, 0.85)",
                width: "min(96vw, 1200px)",
                maxWidth: "1200px",
                height: "min(85dvh, 800px)",
                maxHeight: "800px",
                minHeight: "300px",
                boxSizing: "border-box",
              }}
            >
              <div className="w-full h-full rounded-[14px] overflow-hidden box-border" style={{ boxSizing: "border-box" }}>
            <Stage
              width={size.width}
              height={size.height}
              style={{ background: BACKGROUND, display: "block" }}
              draggable={false}
            >
              <Layer>
                <Group x={0} y={0}>
                  <Rect
                    x={0}
                    y={0}
                    width={boardWidth}
                    height={boardHeight}
                    fill={BACKGROUND}
                    listening={false}
                  />
                  {dotPositions.map((d, i) => (
                    <Circle
                      key={i}
                      x={d.x}
                      y={d.y}
                      radius={DOT_RADIUS}
                      fill={DOT_FILL}
                      listening={false}
                    />
                  ))}
                  {elements.map((element, i) => {
                    const ox = contentOffsetX;
                    const oy = contentOffsetY;
                    if (element.type === "text") {
                      return (
                        <Text
                          key={i}
                          x={element.x + ox}
                          y={element.y + oy}
                          text={element.content}
                          fontSize={element.fontSize ?? 26}
                          fill={STROKE}
                          fontFamily="system-ui, sans-serif"
                          listening={false}
                        />
                      );
                    }
                    if (element.type === "arrow") {
                      return (
                        <Arrow
                          key={i}
                          points={[
                            element.from[0] + ox,
                            element.from[1] + oy,
                            element.to[0] + ox,
                            element.to[1] + oy,
                          ]}
                          stroke={STROKE}
                          fill={STROKE}
                          listening={false}
                        />
                      );
                    }
                    if (element.type === "rect") {
                      return (
                        <Rect
                          key={i}
                          x={element.x + ox}
                          y={element.y + oy}
                          width={element.width}
                          height={element.height}
                          stroke={STROKE}
                          listening={false}
                        />
                      );
                    }
                    if (element.type === "circle") {
                      return (
                        <Circle
                          key={i}
                          x={element.x + ox}
                          y={element.y + oy}
                          radius={element.radius}
                          stroke={STROKE}
                          listening={false}
                        />
                      );
                    }
                    if (element.type === "line") {
                      return (
                        <Line
                          key={i}
                          points={element.points.map((p, j) =>
                            j % 2 === 0 ? p + ox : p + oy
                          )}
                          stroke={STROKE}
                          listening={false}
                        />
                      );
                    }
                    return null;
                  })}
                </Group>
              </Layer>
              <Layer>
                <Group x={0} y={0}>
                  {discussionLayerElements.map((element, i) => {
                    const ox = contentOffsetX;
                    const oy = contentOffsetY;
                    const stroke = DISCUSSION_STROKE;
                    if (element.type === "text") {
                      return (
                        <Text
                          key={`d-${i}`}
                          x={element.x + ox}
                          y={element.y + oy}
                          text={element.content}
                          fontSize={element.fontSize ?? 26}
                          fill={stroke}
                          fontFamily="system-ui, sans-serif"
                          listening={false}
                        />
                      );
                    }
                    if (element.type === "arrow") {
                      return (
                        <Arrow
                          key={`d-${i}`}
                          points={[
                            element.from[0] + ox,
                            element.from[1] + oy,
                            element.to[0] + ox,
                            element.to[1] + oy,
                          ]}
                          stroke={stroke}
                          fill={stroke}
                          listening={false}
                        />
                      );
                    }
                    if (element.type === "rect") {
                      return (
                        <Rect
                          key={`d-${i}`}
                          x={element.x + ox}
                          y={element.y + oy}
                          width={element.width}
                          height={element.height}
                          stroke={stroke}
                          listening={false}
                        />
                      );
                    }
                    if (element.type === "circle") {
                      return (
                        <Circle
                          key={`d-${i}`}
                          x={element.x + ox}
                          y={element.y + oy}
                          radius={element.radius}
                          stroke={stroke}
                          listening={false}
                        />
                      );
                    }
                    if (element.type === "line") {
                      return (
                        <Line
                          key={`d-${i}`}
                          points={element.points.map((p, j) =>
                            j % 2 === 0 ? p + ox : p + oy
                          )}
                          stroke={stroke}
                          listening={false}
                        />
                      );
                    }
                    return null;
                  })}
                </Group>
              </Layer>
            </Stage>
              </div>
            </div>
          )}
        </div>

        {!fullscreen && (
          <p className="mt-2 px-4 text-center text-[11px] text-gray-500 sm:hidden">
            For a wider whiteboard, rotate your phone to landscape or tap{" "}
            <span className="font-medium">Fullscreen</span>.
          </p>
        )}
        {showSubtitles && step?.narration && (
          <div className="mt-3 flex justify-center px-2 sm:px-3">
            <div
              className={`w-full max-w-[min(96vw,1200px)] rounded-xl border px-4 py-3 text-sm shadow-sm ${
                highContrast
                  ? "bg-black text-white border-black"
                  : "bg-white/90 text-[var(--color-text-main)] border-[var(--color-border)]"
              }`}
            >
              {step.narration}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
