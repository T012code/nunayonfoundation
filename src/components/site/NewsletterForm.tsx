"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { subscribe } from "@/app/actions/forms";
import { Button } from "@/components/ui/Button";
import styles from "./NewsletterForm.module.css";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "error"; message: string } | { kind: "done" };

/**
 * Newsletter sign-up with double opt-in: the address is saved as pending and we email a
 * confirmation link. Nobody is added to the list until they click it.
 */
export function NewsletterForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus({ kind: "error", message: "Enter a valid email address, like name@example.com." });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const result = await subscribe(data);
      if (result.ok) {
        setStatus({ kind: "done" });
        router.push("/thank-you/newsletter");
      } else {
        setStatus({ kind: "error", message: result.error });
      }
    } catch {
      setStatus({ kind: "error", message: "Sorry, that didn't go through. Please try again." });
    }
  }

  if (status.kind === "done") {
    return (
      <p className={styles.done} role="status">
        Almost there. Check your inbox and click the link we sent to confirm your subscription.
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
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" hidden />
        <Button type="submit" variant="cta" className={styles.submit} loading={status.kind === "sending"}>
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
