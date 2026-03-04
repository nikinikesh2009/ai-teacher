/**
 * AI lesson generator using DeepSeek API.
 * Generates structured lesson JSON with narration and board elements.
 */

export type GeneratedBoardElement =
  | { type: "text"; content: string; x?: number; y?: number; fontSize?: number }
  | { type: "arrow"; from?: [number, number]; to?: [number, number] }
  | { type: "rect"; x?: number; y?: number; width?: number; height?: number }
  | { type: "circle"; x?: number; y?: number; radius?: number }
  | { type: "line"; points?: number[] };

export type GeneratedStep = {
  id: number;
  narration: string;
  board?: GeneratedBoardElement[];
};

export type GeneratedLesson = {
  title: string;
  steps: GeneratedStep[];
};

const SYSTEM_PROMPT = `You are a professional teacher. Generate a lesson in JSON format only. No markdown, no code blocks, no extra text—only valid JSON.

Structure:
{
  "title": "string",
  "steps": [
    {
      "id": 1,
      "narration": "string",
      "board": [
        {
          "type": "text",
          "content": "string",
          "x": 100,
          "y": 100
        },
        {
          "type": "arrow",
          "from": [200, 250],
          "to": [380, 150]
        },
        {
          "type": "rect",
          "x": 50,
          "y": 50,
          "width": 200,
          "height": 100
        },
        {
          "type": "circle",
          "x": 200,
          "y": 200,
          "radius": 50
        },
        {
          "type": "line",
          "points": [0, 0, 100, 100]
        }
      ]
    }
  ]
}

Rules:
- Use only these board types: "text" | "arrow" | "rect" | "circle" | "line"
- text: content (required), x, y (numbers, optional)
- arrow: from [x,y], to [x,y] (required)
- rect: x, y, width, height (required)
- circle: x, y, radius (required)
- line: points array of [x1,y1,x2,y2,...] (required)
- Keep coordinates in range 0-600 for x, 0-400 for y
- Generate 3-5 educational steps
- Keep diagrams simple and educational`;

export async function generateLesson(topic: string): Promise<GeneratedLesson> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not set");
  }

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Generate a lesson about: ${topic}` },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${err}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("No content in DeepSeek response");
  }

  const trimmed = content.trim();
  const jsonStr = trimmed.replace(/^```(?:json)?\s*|\s*```$/g, "");
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("Failed to parse AI response as JSON");
  }

  return normalizeLesson(parsed);
}

function normalizeLesson(raw: unknown): GeneratedLesson {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid lesson structure");
  }
  const obj = raw as Record<string, unknown>;
  const title = typeof obj.title === "string" ? obj.title : "Untitled Lesson";
  const stepsRaw = Array.isArray(obj.steps) ? obj.steps : [];
  const steps: GeneratedStep[] = stepsRaw.map((s: unknown, i: number) => {
    if (!s || typeof s !== "object") {
      return { id: i + 1, narration: "" };
    }
    const step = s as Record<string, unknown>;
    const id = typeof step.id === "number" ? step.id : i + 1;
    const narration = typeof step.narration === "string" ? step.narration : "";
    const boardRaw = Array.isArray(step.board) ? step.board : [];
    const board: GeneratedBoardElement[] = boardRaw
      .filter((b): b is Record<string, unknown> => b != null && typeof b === "object")
      .map((b) => normalizeBoardElement(b))
      .filter((e): e is GeneratedBoardElement => e != null);
    return { id, narration, board: board.length ? board : undefined };
  });

  return { title, steps };
}

const IMPROVE_PROMPT = `You are improving an existing lesson. Return JSON format only. No markdown, no code blocks—only valid JSON.

Improve clarity, examples, and diagrams. Keep the same structure:
{
  "title": "string",
  "steps": [
    {
      "id": number,
      "narration": "string",
      "board": [ { "type": "text"|"arrow"|"rect"|"circle"|"line", ... } ]
    }
  ]
}

Use only board types: text, arrow, rect, circle, line. Keep coordinates in range 0-600 (x), 0-400 (y).`;

export async function improveLessonContent(lessonJson: object): Promise<GeneratedLesson> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not set");
  }

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: IMPROVE_PROMPT },
        {
          role: "user",
          content: `Current lesson:\n${JSON.stringify(lessonJson)}\n\nReturn the improved lesson as a single JSON object.`,
        },
      ],
      temperature: 0.5,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${err}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("No content in DeepSeek response");
  }

  const trimmed = content.trim().replace(/^```(?:json)?\s*|\s*```$/g, "");
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error("Failed to parse AI improvement response as JSON");
  }

  return normalizeLesson(parsed);
}

function normalizeBoardElement(
  b: Record<string, unknown>
): GeneratedBoardElement | null {
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
