// The visitor's country from the edge headers. Once the domain is proxied by Cloudflare, its
// cf-ipcountry header describes the visitor (Vercel's would describe Cloudflare's servers);
// requests that skip Cloudflare (the *.vercel.app address) use Vercel's. It only pre-selects
// the phone field's country, so a forged header costs nothing.

type Headers = { get(name: string): string | null; has(name: string): boolean };

/** Two-letter country code, or "" when unknown (Cloudflare uses XX for unknown and T1 for Tor). */
export function visitorCountry(h: Headers) {
  const code = ((h.has("cf-ray") ? h.get("cf-ipcountry") : h.get("x-vercel-ip-country")) ?? "").toUpperCase();
  return /^[A-Z]{2}$/.test(code) && code !== "XX" && code !== "T1" ? code : "";
}
