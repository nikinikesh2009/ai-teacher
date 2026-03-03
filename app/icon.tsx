import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
          borderRadius: 24,
        }}
      >
        <span
          style={{
            fontSize: 220,
            fontWeight: 700,
            color: "white",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          T
        </span>
      </div>
    ),
    { ...size }
  );
}
