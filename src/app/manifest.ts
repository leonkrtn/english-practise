import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vocab Trainer — EN/DE",
    short_name: "Vocab Trainer",
    description: "English ↔ German vocabulary & grammar trainer",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f7fb",
    theme_color: "#0071e3",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
