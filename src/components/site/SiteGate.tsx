"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ALWAYS_OPEN } from "@/content/site-mode";

/**
 * While the site is in maintenance or coming-soon mode, visitors see the status page instead
 * of the page asked for. Signed-in team members see the real page with a banner on top: a
 * script in the page head adds `team-view` to <html> before anything is drawn (see the root
 * layout), and the CSS in globals.css swaps which of the two is shown. Newsletter links that
 * people already have in their inbox always open the real page.
 */
export function SiteGate({ status, banner, children }: { status: ReactNode; banner: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  if (ALWAYS_OPEN.some((p) => pathname.startsWith(p))) return children;
  return (
    <>
      <div data-status-page="">{status}</div>
      <div data-gated-site="">
        {banner}
        {children}
      </div>
    </>
  );
}
