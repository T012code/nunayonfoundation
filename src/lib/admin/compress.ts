"use client";

// Photos are compressed in the team member's browser before upload, so the free storage and
// bandwidth go a long way: each upload becomes a few WebP files at set widths (EXIF data such
// as GPS location is dropped by re-drawing), plus a tiny blurred preview. Browsers that can't
// write WebP (older Safari) get JPEG instead.

export const WIDTHS = [480, 960, 1600, 2400];
const QUALITY: Record<number, number> = { 480: 0.8, 960: 0.78, 1600: 0.76, 2400: 0.72 };
const MAX_INPUT = 40 * 1024 * 1024;

export type Compressed = {
  width: number;
  height: number;
  format: "webp" | "jpg";
  files: { width: number; blob: Blob }[];
  blur: string;
  bytesIn: number;
  bytesOut: number;
};

const isHeic = (f: File) => /image\/hei[cf]/i.test(f.type) || /\.(heic|heif)$/i.test(f.name);

async function decode(file: File): Promise<ImageBitmap> {
  try {
    // from-image applies the EXIF rotation so phone photos stand the right way up.
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch (err) {
    if (!isHeic(file)) throw err;
    // iPhone HEIC photos: only Safari decodes these natively; convert elsewhere.
    const { default: heic2any } = await import("heic2any");
    const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
    return createImageBitmap(Array.isArray(out) ? out[0] : out, { imageOrientation: "from-image" });
  }
}

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("This browser can't process images.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return { c, ctx };
}

/** Draws the image at width w, halving in steps for large reductions so detail stays crisp. */
function resize(src: ImageBitmap | HTMLCanvasElement, w: number, h: number) {
  let current: ImageBitmap | HTMLCanvasElement = src;
  let cw = src.width;
  let ch = src.height;
  while (cw / 2 >= w * 1.5) {
    cw = Math.round(cw / 2);
    ch = Math.round(ch / 2);
    const step = canvas(cw, ch);
    step.ctx.drawImage(current, 0, 0, cw, ch);
    current = step.c;
  }
  const out = canvas(w, h);
  out.ctx.drawImage(current, 0, 0, w, h);
  return out.c;
}

function encode(c: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) =>
    c.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't compress this image."))), type, quality),
  );
}

let webp: boolean | null = null;
async function supportsWebp() {
  if (webp === null) {
    const probe = await encode(canvas(2, 2).c, "image/webp", 0.8).catch(() => null);
    webp = probe?.type === "image/webp";
  }
  return webp;
}

export async function compressImage(file: File, onStep?: (done: number, total: number) => void): Promise<Compressed> {
  if (file.size > MAX_INPUT) throw new Error("That photo is over 40 MB. Choose a smaller one.");
  if (!file.type.startsWith("image/") && !isHeic(file)) throw new Error("That file isn't a photo.");
  const bitmap = await decode(file);
  const { width, height } = bitmap;
  const useWebp = await supportsWebp();
  const type = useWebp ? "image/webp" : "image/jpeg";

  // Every standard width smaller than the photo, plus the photo's own width up to 2400px.
  const widths = WIDTHS.filter((w) => w < width);
  if (width <= 2400 && !widths.includes(width)) widths.push(width);
  if (width > 2400) widths.push(2400);
  const unique = [...new Set(widths)].sort((a, b) => a - b);

  const files: Compressed["files"] = [];
  for (const [i, w] of unique.entries()) {
    const h = Math.round((height / width) * w);
    const blob = await encode(resize(bitmap, w, h), type, QUALITY[w] ?? 0.76);
    files.push({ width: w, blob });
    onStep?.(i + 1, unique.length);
  }

  const tiny = resize(bitmap, 16, Math.max(1, Math.round((height / width) * 16)));
  const blur = tiny.toDataURL(type, 0.5);
  bitmap.close();

  return {
    width: Math.min(width, 2400),
    height: Math.round((height / width) * Math.min(width, 2400)),
    format: useWebp ? "webp" : "jpg",
    files,
    blur,
    bytesIn: file.size,
    bytesOut: files.reduce((n, f) => n + f.blob.size, 0),
  };
}

export const formatBytes = (n: number) =>
  n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
