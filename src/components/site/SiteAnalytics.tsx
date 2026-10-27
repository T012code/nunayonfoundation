"use client";

import { Analytics } from "@vercel/analytics/next";

/** Vercel Web Analytics: cookieless page views. Admin pages and private links aren't counted. */
export function SiteAnalytics() {
  return (
    <Analytics
      beforeSend={(event) => {
        const url = new URL(event.url);
        if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/newsletter")) return null;
        return event;
      }}
    />
  );
}
