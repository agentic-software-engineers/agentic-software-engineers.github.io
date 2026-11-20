import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Agentic Software Engineers",
    short_name: "ASE",
    start_url: "/",
    display: "standalone",
    background_color: "#0d0f0f",
    theme_color: "#0d0f0f",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
