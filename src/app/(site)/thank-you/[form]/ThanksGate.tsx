"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { takeThanks } from "@/lib/thanks";

/**
 * Shows the thank-you message only after its form was sent. Opened directly, the visitor goes
 * to the form instead of being thanked for something they didn't do. (A reload right after
 * sending keeps the message.)
 */
export function ThanksGate({ form, fallback, children }: { form: string; fallback: string; children: ReactNode }) {
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const seen = `thanks-shown:${form}`;
    let shown = false;
    try {
      shown = sessionStorage.getItem(seen) === location.href;
    } catch {}
    if (takeThanks(form) || shown) {
      try {
        sessionStorage.setItem(seen, location.href);
      } catch {}
      box.current?.setAttribute("data-thanks", "shown");
    } else {
      router.replace(fallback);
    }
  }, [form, fallback, router]);

  return (
    <div ref={box} data-thanks="waiting">
      {children}
    </div>
  );
}
