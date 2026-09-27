import type { MetadataRoute } from "next";
import { APP } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP.name} — Daily affirmations`,
    short_name: APP.name,
    description: APP.tagline,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFF7F3",
    theme_color: "#FBEFF1",
    categories: ["lifestyle", "health", "personalization"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
