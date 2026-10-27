// Fits saved page text onto the defaults' shape: every field the page expects is there, with
// the saved value when it has the right type and the default otherwise. Used when reading
// (so a page can never break on odd data) and when saving (so only known fields are kept).

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const isUpload = (v: unknown) => isObj(v) && typeof v.id === "string" && Array.isArray(v.sizes);

export function fitCopy<T>(def: T, val: unknown, key = ""): T {
  if (Array.isArray(def)) {
    if (!Array.isArray(val)) return def;
    const template = def[0];
    return val.slice(0, 200).map((v) => (template === undefined ? v : fitCopy(template, v, key))) as T;
  }
  if (isObj(def)) {
    if (!isObj(val)) return def;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(def)) out[k] = k in val ? fitCopy(def[k], val[k], k) : def[k];
    return out as T;
  }
  if (typeof def === "string") {
    // Photo fields hold a built-in photo's name or an uploaded photo.
    if (key === "image" && isUpload(val)) return val as T;
    return (typeof val === "string" ? val.slice(0, 20000) : def) as T;
  }
  if (typeof def === "number") return (typeof val === "number" && Number.isFinite(val) ? val : def) as T;
  return def;
}
