import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cresco",
    short_name: "Cresco",
    description: "Money skills today. A brighter tomorrow.",
    start_url: "/home",
    display: "standalone",
    background_color: "#fbf8f1",
    theme_color: "#fbf8f1",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
