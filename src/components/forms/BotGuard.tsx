"use client";

import { useEffect, useRef } from "react";
import styles from "./forms.module.css";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
    __turnstileLoading?: Promise<void>;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

function loadTurnstile() {
  window.__turnstileLoading ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Turnstile failed to load"));
    document.head.appendChild(s);
  });
  return window.__turnstileLoading;
}

/**
 * Spam protection for a form: a hidden field that only bots fill in, plus Cloudflare
 * Turnstile, which usually stays invisible and only asks for a click when unsure.
 * `resetKey` changes after a failed submission so a fresh token is fetched.
 */
export function BotGuard({ resetKey = 0 }: { resetKey?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const id = useRef<string | null>(null);

  useEffect(() => {
    if (!SITE_KEY || !box.current) return;
    let cancelled = false;
    loadTurnstile()
      .then(() => {
        if (cancelled || !box.current || !window.turnstile) return;
        id.current = window.turnstile.render(box.current, {
          sitekey: SITE_KEY,
          appearance: "interaction-only",
          "refresh-expired": "auto",
          "response-field-name": "cf-turnstile-response",
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (id.current) window.turnstile?.remove(id.current);
      id.current = null;
    };
  }, []);

  useEffect(() => {
    if (resetKey && id.current) window.turnstile?.reset(id.current);
  }, [resetKey]);

  return (
    <>
      <div className={styles.trap} aria-hidden="true">
        <label>
          Leave this empty
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {SITE_KEY ? <div ref={box} className={styles.turnstile} /> : null}
    </>
  );
}

/** Form-level error (the server couldn't take the form), announced to screen readers. */
export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className={styles.formError} role="alert">
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" />
        <path d="M8 4.75v3.75M8 11h.01" />
      </svg>
      {message}
    </p>
  );
}
