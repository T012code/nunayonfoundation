"use client";

import { useEffect } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button, ButtonLink } from "@/components/ui/Button";
import styles from "./thank-you/[form]/thank-you.module.css";

// Something broke while showing a page (error 500). The header, menu and footer stay, so
// visitors can carry on; "Try again" re-renders the page.
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className={styles.section}>
      <div className={styles.halo} aria-hidden="true" />
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.sprout} aria-hidden="true">
          <Logo variant="mark" className={styles.mark} />
        </div>
        <h1 className={styles.title}>Something went wrong on our side.</h1>
        <p className={styles.body}>
          Sorry about that. Please try again in a moment. If it keeps happening, let us know and we&apos;ll fix it.
          {error.digest ? <span style={{ display: "block", marginTop: "0.75rem", fontSize: "0.8125rem" }}>Reference: {error.digest}</span> : null}
        </p>
        <div className={styles.actions}>
          <Button type="button" variant="primary" onClick={reset}>
            Try again
          </Button>
          <ButtonLink href="/" variant="ghost" arrow={false}>
            Back to home
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
