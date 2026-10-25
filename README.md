# Nunayon Foundation

Website for [nunayonfoundation.org](https://www.nunayonfoundation.org).

- **Next.js 16** (App Router), React 19, TypeScript, Motion
- **Supabase** (database, auth, storage) — admin build in progress
- **Vercel** hosting, **Cloudflare** DNS and Turnstile

## Local setup

```bash
npm install
npm run dev
```

## Where things live

- `brand/` — logo, colours, typography and tokens (see `brand/BRAND.md`)
- `src/content/site.ts` — placeholder copy, figures, contact and bank details. Moves to the database with the admin build.
- `public/placeholder/` — temporary stock photos (Pexels, free licence) in pre-made WebP sizes.
  Rebuild with `npm run images:placeholder`; sources are listed in `src/content/placeholder-images.json`.
- `supabase/migrations/` — database migrations
- `.github/workflows/supabase-keep-alive.yml` — keeps the free Supabase project from pausing

## Images

Photos are never resized on request. Each image is saved once in four widths (480, 960, 1600, 2400 px,
WebP) and served with `srcset`, which keeps Supabase storage and Vercel image costs at zero.
