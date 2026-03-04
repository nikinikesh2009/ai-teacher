import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/getAdminFromRequest";
import type { BoardElement } from "@/lib/boardTypes";

const SYSTEM_PROMPT = `You are generating clear educational diagrams for a whiteboard.
Respond with JSON only. No markdown, no code fences.

You will get a detailed description of a single diagram.

Return exactly:
{
  "elements": [
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

Rules:
- Use only these types: text, arrow, rect, circle, line.
- Keep x in [0,600], y in [0,400].
- Use 2–20 elements total.
- Avoid overlapping labels with shapes or other labels.
- For trees and graphs, use clear horizontal levels.
- For physics diagrams, draw forces as arrows with labels outside the object.
- For math graphs, draw simple axes and 1–2 key points or curves.
`;

type StarterAsset = {
  name: string;
  description: string;
};

const STARTER_ASSETS: StarterAsset[] = [
  {
    name: "Binary tree (3 levels)",
    description:
      "Binary tree with 3 levels: root labeled 'Root' at top center, two children labeled 'Left child' and 'Right child' on second row, and two leaves on third row labeled 'Leaf'. Boxes for each node, arrows from parent to children.",
  },
  {
    name: "Linked list (5 nodes)",
    description:
      "Singly linked list of 5 nodes laid out horizontally, each as a rectangle labeled with numbers 1 to 5, arrows pointing from left node to right node.",
  },
  {
    name: "Stack diagram",
    description:
      "Vertical stack of 4 rectangles labeled from top to bottom 'Top', 'Item 2', 'Item 3', 'Bottom', with a big label 'STACK' on the side.",
  },
  {
    name: "Queue diagram",
    description:
      "Horizontal queue with 4 boxes inside a large rectangle, arrows labeled 'Front' on the left and 'Rear' on the right.",
  },
  {
    name: "Star network topology",
    description:
      "Network star topology: central circle labeled 'Switch', 4 computers as rectangles around it labeled 'PC1' to 'PC4', lines from each PC to the switch.",
  },
  {
    name: "Bus network topology",
    description:
      "Bus topology: horizontal line as main bus, 4 small rectangles labeled 'PC1' to 'PC4' connected vertically to the bus line.",
  },
  {
    name: "Free-body block on table",
    description:
      "Free body diagram: rectangle block on horizontal line representing table, arrow down labeled 'Weight', arrow up labeled 'Normal', arrow right labeled 'Applied force', arrow left labeled 'Friction'. All labels near arrow tips, not overlapping block.",
  },
  {
    name: "Inclined plane forces",
    description:
      "Block on inclined plane: slanted rectangle as plane, small block on plane, arrow perpendicular to plane labeled 'Normal', arrow down vertical labeled 'Weight', arrow down along plane labeled 'Component of weight'.",
  },
  {
    name: "Ohm's law simple circuit",
    description:
      "Simple series circuit rectangle: battery on left labeled 'V', resistor on right labeled 'R', arrows around loop indicating current I, label 'V = IR' near top.",
  },
  {
    name: "Series circuit (two resistors)",
    description:
      "Series circuit: battery on left, two resistors in series labeled R1 and R2 on right side of loop, current arrow I around loop.",
  },
  {
    name: "Parallel circuit (two resistors)",
    description:
      "Parallel circuit: battery on left, two vertical branches on right with resistors labeled R1 and R2, current arrows splitting into I1 and I2.",
  },
  {
    name: "Cartesian axes",
    description:
      "Cartesian coordinate system: horizontal x-axis and vertical y-axis crossing at origin, arrows at ends, labels 'x' and 'y', origin labeled (0,0).",
  },
  {
    name: "Parabola y = x^2",
    description:
      "Graph of y = x^2 on Cartesian axes: parabola opening upwards with vertex at origin, point at (1,1) labeled, axes labeled x and y.",
  },
  {
    name: "Sine wave",
    description:
      "Graph of y = sin(x): horizontal axis labeled x with ticks, smooth sine curve crossing origin, peak labeled '1' and trough labeled '-1'.",
  },
  {
    name: "Bar chart (3 bars)",
    description:
      "Simple bar chart: x-axis and y-axis, three vertical bars labeled A, B, C on x-axis with increasing heights.",
  },
  {
    name: "Venn diagram (2 sets)",
    description:
      "Two intersecting circles labeled A and B, overlap region shaded by a label 'A ∩ B'.",
  },
  {
    name: "If/Else flowchart",
    description:
      "Flowchart: rounded rectangle 'Start' at top, arrow to diamond 'Condition?', arrow right to rectangle 'If true', arrow down from diamond to rectangle 'If false', arrows from both to rounded rectangle 'End'.",
  },
  {
    name: "CPU components",
    description:
      "Simple CPU block diagram: big rectangle 'CPU', inside two smaller rectangles 'ALU' and 'Control Unit', arrow from 'Main Memory' rectangle on left into CPU.",
  },
  {
    name: "Client-server model",
    description:
      "Client-server: one rectangle on right labeled 'Server', three rectangles on left labeled 'Client 1', 'Client 2', 'Client 3', arrows from each client to server and back.",
  },
  {
    name: "Class inheritance tree",
    description:
      "UML-style inheritance: top rectangle labeled 'Animal', two rectangles below labeled 'Dog' and 'Cat', arrows with empty triangle arrowheads pointing from Dog and Cat up to Animal.",
  },
];

function requireAdmin(request: NextRequest) {
  if (!getAdminFromRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function normalizeElement(raw: unknown): BoardElement | null {
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

async function generateElements(description: string, apiKey: string): Promise<BoardElement[]> {
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
        {
          role: "user",
          content: `Create a diagram for this starter asset: ${description}`,
        },
      ],
      temperature: 0.5,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("No content in AI response");
  }

  const trimmed = content.trim().replace(/^```(?:json)?\s*|\s*```$/g, "");
  let parsed: { elements?: unknown[] };
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error("Failed to parse AI response JSON");
  }

  const raws = Array.isArray(parsed.elements) ? parsed.elements : [];
  const elements: BoardElement[] = raws
    .map((e) => normalizeElement(e))
    .filter((e): e is BoardElement => e != null);
  return elements;
}

export async function POST(request: NextRequest) {
  const unauth = requireAdmin(request);
  if (unauth) return unauth;

  try {
    const existing = await sql`SELECT COUNT(*)::int AS count FROM board_assets`;
    const count = Number((existing[0] as { count: number }).count ?? 0);
    if (count > 0) {
      return NextResponse.json({
        created: 0,
        skipped: true,
        reason: "board_assets table is not empty",
      });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "DEEPSEEK_API_KEY is not set" },
        { status: 500 }
      );
    }

    let created = 0;
    for (const asset of STARTER_ASSETS) {
      try {
        const elements = await generateElements(asset.description, apiKey);
        const json = JSON.stringify(elements);
        await sql`
          INSERT INTO board_assets (name, drawing_json)
          VALUES (${asset.name}, ${json}::jsonb)
        `;
        created += 1;
      } catch (err) {
        // Skip failed asset but continue with others
        console.error("Failed to create starter asset", asset.name, err);
      }
    }

    return NextResponse.json({ created, totalPlanned: STARTER_ASSETS.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

