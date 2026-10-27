"use client";

import { MEDIA_BUCKET, mediaPath, type MediaRef } from "@/content/images";
import { createClient } from "@/lib/supabase/browser";
import { compressImage, type Compressed } from "./compress";

export type UploadProgress = { stage: "compressing" | "uploading"; done: number; total: number };

/**
 * Compresses a photo in the browser, uploads its sizes to storage and records it in the media
 * library. Returns the reference to store in content. Cleans up if any step fails.
 */
export async function uploadPhoto(
  file: File,
  opts: { alt?: string; onProgress?: (p: UploadProgress) => void } = {},
): Promise<{ ref: MediaRef; result: Compressed }> {
  const result = await compressImage(file, (done, total) => opts.onProgress?.({ stage: "compressing", done, total }));
  const supabase = createClient();
  const id = crypto.randomUUID();
  const contentType = result.format === "webp" ? "image/webp" : "image/jpeg";
  const uploaded: string[] = [];
  try {
    for (const [i, f] of result.files.entries()) {
      const path = mediaPath(id, f.width, result.format);
      const { error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, f.blob, { contentType, cacheControl: "31536000", upsert: false });
      if (error) throw new Error(error.message);
      uploaded.push(path);
      opts.onProgress?.({ stage: "uploading", done: i + 1, total: result.files.length });
    }
    const alt = (opts.alt ?? "").trim();
    const sizes = result.files.map((f) => f.width);
    const { error } = await supabase.from("media").insert({
      id,
      width: result.width,
      height: result.height,
      sizes,
      bytes: result.bytesOut,
      blur: result.blur,
      alt,
      format: result.format,
      name: file.name.slice(0, 200),
    });
    if (error) throw new Error(error.message);
    return {
      ref: { id, w: result.width, h: result.height, sizes, blur: result.blur, alt, ext: result.format },
      result,
    };
  } catch (err) {
    if (uploaded.length) await supabase.storage.from(MEDIA_BUCKET).remove(uploaded);
    throw err;
  }
}
