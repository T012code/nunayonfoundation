"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import styles from "./NewsletterForm.module.css";

type Status = { kind: "idle" } | { kind: "error"; message: string } | { kind: "done" };

/**
 * Newsletter sign-up. Preview build: validates and confirms on screen only. The admin build
 * connects it to the subscriber list with a confirmation email (double opt-in).
 */
export function NewsletterForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus({ kind: "error", message: "Enter a valid email address, like name@example.com." });
      return;
    }
    setStatus({ kind: "done" });
  }

  if (status.kind === "done") {
    return (
      <p className={styles.done} role="status">
        Thank you. Newsletter sign-ups open when the site launches, and we&apos;ll email you to confirm.
      </p>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <label htmlFor="newsletter-email" className="visually-hidden">
        Email address
      </label>
      <div className={styles.field} data-invalid={status.kind === "error" || undefined}>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Your email address"
          className={styles.input}
          aria-invalid={status.kind === "error" || undefined}
          aria-describedby={status.kind === "error" ? "newsletter-error" : undefined}
          onChange={() => status.kind === "error" && setStatus({ kind: "idle" })}
        />
        <Button type="submit" variant="cta" className={styles.submit}>
          Subscribe
        </Button>
      </div>
      {status.kind === "error" ? (
        <p id="newsletter-error" className={styles.error} role="alert">
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
