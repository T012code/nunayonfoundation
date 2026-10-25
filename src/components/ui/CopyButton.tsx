"use client";

import { useEffect, useState } from "react";
import styles from "./CopyButton.module.css";

type State = "idle" | "copied" | "failed";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    if (state === "idle") return;
    const id = window.setTimeout(() => setState("idle"), 2400);
    return () => window.clearTimeout(id);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  return (
    <button type="button" className={styles.button} data-state={state} onClick={copy} aria-label={`Copy ${label}`}>
      <span aria-live="polite">{state === "copied" ? "Copied" : state === "failed" ? "Select and copy" : "Copy"}</span>
      <svg viewBox="0 0 16 16" aria-hidden="true">
        {state === "copied" ? (
          <path d="m3.5 8.5 3 3 6-7" />
        ) : (
          <>
            <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
            <path d="M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
          </>
        )}
      </svg>
    </button>
  );
}
