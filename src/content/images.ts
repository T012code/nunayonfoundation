import manifest from "./placeholder-images.json";
import { SUPABASE_URL } from "@/lib/env";

export type ImageSlug = keyof typeof manifest;

/** An uploaded photo: compressed in the browser into WebP files at a few widths. */
export type MediaRef = { id: string; w: number; h: number; sizes: number[]; blur: string; alt: string; ext?: "webp" | "jpg" };

/** What image fields hold: a placeholder photo's name or an uploaded photo. */
export type ImageRef = ImageSlug | MediaRef;

export type ImageSource = {
  src: string;
  srcSet: string;
  width: number;
  height: number;
  alt: string;
  blur: string;
};

export const MEDIA_BUCKET = "media";
export const mediaPath = (id: string, w: number, ext: "webp" | "jpg" = "webp") => `${id}-${w}.${ext}`;
export const mediaUrl = (id: string, w: number, ext?: "webp" | "jpg") =>
  `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${mediaPath(id, w, ext)}`;

const FALLBACK: ImageSlug = "children-waving";

// Placeholder photos are pre-sized WebP files in /public/placeholder (see scripts/placeholder-images.mjs).
// Uploaded photos follow the same pattern in storage: one file per width.
export function image(ref: ImageRef | null | undefined): ImageSource {
  if (ref && typeof ref === "object") {
    const largest = ref.sizes[ref.sizes.length - 1];
    return {
      src: mediaUrl(ref.id, largest, ref.ext),
      srcSet: ref.sizes.map((w) => `${mediaUrl(ref.id, w, ref.ext)} ${w}w`).join(", "),
      width: ref.w,
      height: ref.h,
      alt: ref.alt,
      blur: ref.blur,
    };
  }
  const slug = ref && ref in manifest ? ref : FALLBACK;
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

/** Absolute URL of a mid-size version, for social cards and the sitemap. */
export function shareImage(ref: ImageRef | null | undefined, siteUrl: string) {
  if (ref && typeof ref === "object") {
    const w = ref.sizes.find((s) => s >= 1200) ?? ref.sizes[ref.sizes.length - 1];
    return mediaUrl(ref.id, w, ref.ext);
  }
  const slug = ref && ref in manifest ? ref : FALLBACK;
  return `${siteUrl}/placeholder/${slug}-1600.webp`;
}

/** Stable React key for an image. */
export const imageKey = (ref: ImageRef) => (typeof ref === "string" ? ref : ref.id);

/** A small version for previews in the admin. */
export function thumbUrl(ref: ImageRef | null | undefined, min = 480) {
  if (ref && typeof ref === "object") {
    const w = ref.sizes.find((s) => s >= min) ?? ref.sizes[ref.sizes.length - 1];
    return mediaUrl(ref.id, w, ref.ext);
  }
  const slug = ref && ref in manifest ? ref : FALLBACK;
  return `/placeholder/${slug}-480.webp`;
}
