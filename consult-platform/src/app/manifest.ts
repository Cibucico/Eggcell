import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";

/** Lets people install the site on a phone's home screen like an app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.name,
    short_name: brand.name.split(" ")[0],
    description: brand.description,
    start_url: "/",
    display: "standalone",
    background_color: brand.theme.background,
    theme_color: brand.theme.deep,
    icons: brand.icons
      ? [
          { src: brand.icons.s192, sizes: "192x192", type: "image/png" },
          { src: brand.icons.s512, sizes: "512x512", type: "image/png" },
          { src: brand.icons.s512, sizes: "512x512", type: "image/png", purpose: "maskable" },
        ]
      : [],
  };
}
