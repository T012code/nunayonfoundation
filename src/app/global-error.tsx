"use client";

import { useEffect } from "react";
import "./globals.css";

// The last safety net: the whole site failed to load (even its layout). Kept plain on purpose,
// with only the brand colours, so it shows whatever else is broken.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en-NG">
      <body>
        <main
          style={{
            display: "grid",
            minHeight: "100dvh",
            placeItems: "center",
            padding: "2rem 1rem",
            background: "var(--teal)",
            color: "var(--cream)",
            textAlign: "center",
            fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          }}
        >
          <div style={{ maxWidth: "34rem" }}>
            <p style={{ margin: 0, fontSize: "0.8125rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--mint)" }}>
              Nunayon Foundation
            </p>
            <h1 style={{ margin: "1rem 0 0", fontSize: "clamp(2rem, 1.4rem + 3vw, 3.25rem)", lineHeight: 1.08, letterSpacing: "-0.03em" }}>
              The site couldn&apos;t load just now.
            </h1>
            <p style={{ margin: "1rem 0 0", fontSize: "1.125rem", color: "var(--color-on-inverse-muted)" }}>
              Please try again in a minute. If it keeps happening, email us at hello@nunayonfoundation.org.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: "2rem",
                padding: "0.85rem 1.6rem",
                border: 0,
                borderRadius: "999px",
                background: "var(--amber)",
                color: "var(--teal)",
                font: "inherit",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            {error.digest ? <p style={{ marginTop: "1.5rem", fontSize: "0.8125rem", opacity: 0.7 }}>Reference: {error.digest}</p> : null}
          </div>
        </main>
      </body>
    </html>
  );
}
