"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Stage, Layer, Group, Text, Line, Rect, Arrow, Circle } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { BoardElement } from "@/lib/boardTypes";

const STROKE = "#2f2f2f";
const BACKGROUND = "#fdfcf8";
const GRID_SPACING = 28;
const DOT_RADIUS = 1.2;
const DOT_FILL = "rgba(47, 47, 47, 0.25)";

export type WhiteboardEditorMode = "lesson" | "asset";

interface WhiteboardEditorProps {
  mode: WhiteboardEditorMode;
  elements: BoardElement[];
  overlayElements?: BoardElement[];
  onChange?: (elements: BoardElement[]) => void;
  className?: string;
}

export default function WhiteboardEditor({
  mode,
  elements,
  overlayElements = [],
  onChange,
  className = "",
}: WhiteboardEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 500 });

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

  const boardWidth = size.width;
  const boardHeight = size.height;
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

  const handleAddPoint = (evt: KonvaEventObject<MouseEvent>) => {
    if (!onChange) return;
    if (mode !== "asset") return;

    const stage = evt.target.getStage();
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const x = pointer.x - contentOffsetX;
    const y = pointer.y - contentOffsetY;

    const next: BoardElement = {
      type: "circle",
      x,
      y,
      radius: 6,
    };
    onChange([...elements, next]);
  };

  return (
    <div
      ref={containerRef}
      className={className || "w-full h-full rounded-2xl overflow-hidden border border-slate-200 bg-[var(--color-surface)]"}
    >
      <Stage
        width={size.width}
        height={size.height}
        style={{ background: BACKGROUND, display: "block" }}
        draggable={false}
        onDblClick={handleAddPoint}
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
        {overlayElements.length > 0 && (
          <Layer>
            <Group x={0} y={0}>
              {overlayElements.map((element, i) => {
                const ox = contentOffsetX;
                const oy = contentOffsetY;
                const stroke = "#444";
                if (element.type === "text") {
                  return (
                    <Text
                      key={`o-${i}`}
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
                      key={`o-${i}`}
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
                      key={`o-${i}`}
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
                      key={`o-${i}`}
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
                      key={`o-${i}`}
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
        )}
      </Stage>
    </div>
  );
}

