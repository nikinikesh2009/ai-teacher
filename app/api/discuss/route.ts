import { NextResponse } from "next/server";
import type { BoardElement } from "@/lib/boardTypes";

const SYSTEM_PROMPT = `You are a patient teacher in a discussion with a student. Respond in JSON only. No markdown, no code blocks.

Structure:
{
  "speech": "string - what you say aloud to the student",
  "draw": [
    {
      "type": "text" | "arrow" | "rect" | "circle" | "line",
      "content": "for text only",
      "x": 100, "y": 100,
      "from": [x,y], "to": [x,y],
      "width": 100, "height": 80,
      "radius": 50,
      "points": [x1,y1,x2,y2,...]
    }
  ]
}

draw is optional. Use it to sketch simple diagrams that help explain. Keep coordinates in 0-600 (x), 0-400 (y).`;

function normalizeDrawElement(raw: unknown): BoardElement | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const t = typeof b.type === "string" ? b.type : "";
  switch (t) {
    case "text": {
      const content = typeof b.content === "string" ? b.content : "";
      const x = typeof b.x === "number" ? b.x : 0;
      const y = typeof b.y === "number" ? b.y : 0;
      const fontSize = typeof b.fontSize === "number" ? b.fontSize : undefined;
      return { type: "text", content, x, y, fontSize };
    }
    case "arrow": {
      const from: [number, number] =
        Array.isArray(b.from) && b.from.length >= 2
          ? ([Number(b.from[0]) || 0, Number(b.from[1]) || 0] as [number, number])
          : ([0, 0] as [number, number]);
      const to: [number, number] =
        Array.isArray(b.to) && b.to.length >= 2
          ? ([Number(b.to[0]) || 0, Number(b.to[1]) || 0] as [number, number])
          : ([100, 100] as [number, number]);
      return { type: "arrow", from, to };
    }
    case "rect": {
      const x = typeof b.x === "number" ? b.x : 0;
      const y = typeof b.y === "number" ? b.y : 0;
      const width = typeof b.width === "number" ? b.width : 100;
      const height = typeof b.height === "number" ? b.height : 80;
      return { type: "rect", x, y, width, height };
    }
    case "circle": {
      const x = typeof b.x === "number" ? b.x : 0;
      const y = typeof b.y === "number" ? b.y : 0;
      const radius = typeof b.radius === "number" ? b.radius : 40;
      return { type: "circle", x, y, radius };
    }
    case "line": {
      const pts = Array.isArray(b.points)
        ? b.points.map((p) => (typeof p === "number" ? p : 0))
        : [0, 0, 100, 100];
      return { type: "line", points: pts };
    }
    default:
      return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const stepContext = typeof body?.stepContext === "string" ? body.stepContext : "";
    const lessonTitle = typeof body?.lessonTitle === "string" ? body.lessonTitle : "";

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "DEEPSEEK_API_KEY is not set" },
        { status: 500 }
      );
    }

    const userPrompt = [
      lessonTitle && `Lesson: ${lessonTitle}`,
      stepContext && `Current step context: ${stepContext}`,
      `Student question: ${message}`,
    ]
      .filter(Boolean)
      .join("\n");

    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `DeepSeek API error: ${res.status}` },
        { status: 500 }
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "No content in AI response" },
        { status: 500 }
      );
    }

    const trimmed = content.trim().replace(/^```(?:json)?\s*|\s*```$/g, "");
    let parsed: { speech?: string; draw?: unknown[] };
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return NextResponse.json(
        { speech: content, draw: undefined },
        { status: 200 }
      );
    }

    const speech = typeof parsed.speech === "string" ? parsed.speech : content;
    const drawRaw = Array.isArray(parsed.draw) ? parsed.draw : [];
    const draw: BoardElement[] = drawRaw
      .map((d) => normalizeDrawElement(d))
      .filter((e): e is BoardElement => e != null);

    return NextResponse.json({ speech, draw });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
