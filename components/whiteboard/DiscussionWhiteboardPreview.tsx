"use client";

import { useRef, useState, useEffect } from "react";
import { Stage, Layer, Group, Text, Line, Rect, Arrow, Circle } from "react-konva";
import type { BoardElement } from "@/lib/boardTypes";

const STROKE = "#444";
const BACKGROUND = "#fdfcf8";
const DESIGN_W = 600;
const DESIGN_H = 400;

interface DiscussionWhiteboardPreviewProps {
  elements: BoardElement[];
}

export default function DiscussionWhiteboardPreview({ elements }: DiscussionWhiteboardPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 280, height: 180 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (el) {
        const w = Math.floor(el.clientWidth) || 280;
        const h = Math.floor(el.clientHeight) || 180;
        setSize({ width: w, height: h });
      }
    });
    ro.observe(el);
    setSize({ width: el.clientWidth || 280, height: el.clientHeight || 180 });
    return () => ro.disconnect();
  }, []);

  const scale = Math.min(size.width / DESIGN_W, size.height / DESIGN_H, 1);
  const ox = size.width / 2 - (DESIGN_W * scale) / 2;
  const oy = size.height / 2 - (DESIGN_H * scale) / 2;

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[140px] rounded-lg border border-gray-200 bg-[#fdfcf8] overflow-hidden"
    >
      <Stage width={size.width} height={size.height} style={{ display: "block" }}>
        <Layer>
          <Group x={0} y={0}>
            <Rect
              x={0}
              y={0}
              width={size.width}
              height={size.height}
              fill={BACKGROUND}
              listening={false}
            />
          </Group>
        </Layer>
        <Layer>
          <Group x={ox} y={oy} scaleX={scale} scaleY={scale}>
            {elements.map((element, i) => {
              if (element.type === "text") {
                return (
                  <Text
                    key={i}
                    x={element.x}
                    y={element.y}
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
                      element.from[0],
                      element.from[1],
                      element.to[0],
                      element.to[1],
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
                    x={element.x}
                    y={element.y}
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
                    x={element.x}
                    y={element.y}
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
                    points={element.points}
                    stroke={STROKE}
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
  );
}
