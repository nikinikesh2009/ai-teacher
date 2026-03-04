export type BoardElement =
  | {
      type: "text";
      x: number;
      y: number;
      content: string;
      fontSize?: number;
    }
  | {
      type: "arrow";
      from: [number, number];
      to: [number, number];
    }
  | {
      type: "line";
      points: number[];
    }
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      x: number;
      y: number;
      radius: number;
    };
