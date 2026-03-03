import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TutorFlow",
    short_name: "TutorFlow",
    description: "TutorFlow - Learning platform",
    start_url: "/",
    display: "standalone",
    background_color: "#F1F5F9",
    theme_color: "#2563EB",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
