import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: 36,
        }}
      >
        <span
          style={{
            fontSize: 100,
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
