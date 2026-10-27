import "server-only";
import type { ImageRef } from "@/content/images";
import { ActionError } from "./access";

// Reading admin forms on the server: everything is trimmed, length-capped and type-checked.

export const str = (fd: FormData, name: string, max = 500) => String(fd.get(name) ?? "").trim().slice(0, max);

export function required(fd: FormData, name: string, label: string, max = 500) {
  const v = str(fd, name, max);
  if (!v) throw new ActionError(`Add the ${label.toLowerCase()}.`);
  return v;
}

export const bool = (fd: FormData, name: string) => fd.get(name) === "on";

export function json<T>(fd: FormData, name: string, fallback: T): T {
  const raw = String(fd.get(name) ?? "");
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new ActionError("Something in the form couldn't be read. Reload the page and try again.");
  }
}

/** An image reference from an image field, checked for shape. */
export function imageRef(fd: FormData, name: string): ImageRef | null {
  const v = json<unknown>(fd, name, null);
  if (v === null || v === "") return null;
  if (typeof v === "string") return v as ImageRef;
  if (v && typeof v === "object" && "id" in v && "sizes" in v) return v as ImageRef;
  throw new ActionError("That image couldn't be read. Choose it again.");
}

export function imageRefs(fd: FormData, name: string): ImageRef[] {
  const v = json<unknown[]>(fd, name, []);
  return Array.isArray(v) ? (v.filter((x) => typeof x === "string" || (x && typeof x === "object" && "id" in x)) as ImageRef[]) : [];
}

/** "Clean Water & Community" → "clean-water-community". */
export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
