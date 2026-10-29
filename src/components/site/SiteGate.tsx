"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ALWAYS_OPEN } from "@/content/site-mode";

/**
 * While the site is in maintenance or coming-soon mode, shows the status page instead of the
 * page asked for, except the newsletter links people already have in their inbox.
 */
export function SiteGate({ status, children }: { status: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  return ALWAYS_OPEN.some((p) => pathname.startsWith(p)) ? children : status;
}
