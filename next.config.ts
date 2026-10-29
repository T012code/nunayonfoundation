import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://va.vercel-scripts.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com https://vitals.vercel-insights.com",
  "frame-src https://challenges.cloudflare.com https://www.youtube-nocookie.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

// The site's own address. Visitors who reach it through Vercel's addresses
// (nunayonfoundation.vercel.app and the like) are sent here, so links, the logo and sign-ins
// all stay on one domain. Preview builds (random *.vercel.app addresses) are left alone.
const SITE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
const VERCEL_ALIASES = "nunayonfoundation(-layo5|-git-claude-trusting-lovelace-xzsdbd-layo5)?\\.vercel\\.app";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      // Scheduled jobs (/api/…) keep working on any address; everything else moves over.
      ...(SITE
        ? [{ source: "/:path((?!api/).*)", has: [{ type: "host" as const, value: VERCEL_ALIASES }], destination: `${SITE}/:path`, permanent: false }]
        : []),
      { source: "/get-involved", destination: "/volunteer", permanent: true },
      { source: "/security.txt", destination: "/.well-known/security.txt", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Pre-sized photos never change name, so browsers and the CDN can keep them for a year.
      { source: "/placeholder/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/flags/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }] },
      // *.vercel.app addresses are for testing: keep them out of search results.
      {
        source: "/:path*",
        has: [{ type: "host", value: "(?<host>.+)\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
