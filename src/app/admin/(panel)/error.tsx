"use client";

import { useEffect } from "react";
import { PageHead, adminStyles as s } from "@/components/admin/ui";

// A page in the admin failed to load. The sidebar stays, so you can go elsewhere or try again.
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className={s.page}>
      <PageHead title="This page didn't load" lead="Something went wrong while loading it. Your saved work is safe." />
      <div className={s.card}>
        <p className={s.small}>
          Try again. If it keeps happening, send the reference below to whoever looks after the site.
          {error.digest ? <span className={s.muted}> Reference: {error.digest}</span> : null}
        </p>
        <div className={s.actions}>
          <button type="button" className={s.primaryButton} onClick={reset}>
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
