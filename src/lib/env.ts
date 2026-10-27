// The public address of the site, without a trailing slash. Vercel previews fall back to
// their own deployment URL so share links and the sitemap point somewhere real.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

// Public project details (also sent to browsers). Environment variables override them if the
// project ever moves.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://qmelvymbmxafttgzxpcg.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_BuGkwUM5YaAUL4E_qFum1w_mXjIuTI5";
