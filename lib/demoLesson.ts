import type { BoardElement } from "./boardTypes";

export type LessonStep = {
  id: number;
  narration: string;
  board?: BoardElement[];
  allowDiscussion?: boolean;
  videoId?: string;
};

export const demoLesson = {
  title: "Introduction to Vectors",
  steps: [
    {
      id: 1,
      narration: "A vector has magnitude and direction.",
      board: [
        {
          type: "arrow",
          from: [200, 250],
          to: [380, 150],
        },
        {
          type: "text",
          x: 390,
          y: 140,
          content: "Vector V",
        },
      ],
      allowDiscussion: true,
    },
    {
      id: 2,
      narration: "Watch this explanation about vectors.",
      videoId: "fNk_zzaMoSs",
      allowDiscussion: true,
    },
    {
      id: 3,
      narration: "Vector equals magnitude plus direction.",
      board: [
        {
          type: "text",
          x: 200,
          y: 200,
          content: "Vector = magnitude + direction",
        },
      ],
      allowDiscussion: true,
    },
  ],
};
