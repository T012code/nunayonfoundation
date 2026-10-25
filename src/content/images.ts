import manifest from "./placeholder-images.json";

export type ImageSlug = keyof typeof manifest;

export type ImageSource = {
  src: string;
  srcSet: string;
  width: number;
  height: number;
  alt: string;
  blur: string;
};

// Placeholder photos are pre-sized WebP files in /public/placeholder (see scripts/placeholder-images.mjs).
// Uploaded photos will follow the same naming: one file per width.
export function image(slug: ImageSlug): ImageSource {
  const m = manifest[slug];
  const largest = m.sizes[m.sizes.length - 1];
  return {
    src: `/placeholder/${slug}-${largest}.webp`,
    srcSet: m.sizes.map((w) => `/placeholder/${slug}-${w}.webp ${w}w`).join(", "),
    width: m.width,
    height: m.height,
    alt: m.alt,
    blur: m.blur,
  };
}
