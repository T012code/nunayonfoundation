import type { MetadataRoute } from "next";
import { site } from "@/content/site";

// Lets phones add the site to the home screen with the right name, icon and colours.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Nunayon",
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#FDF7EC",
    theme_color: "#FDF7EC",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
