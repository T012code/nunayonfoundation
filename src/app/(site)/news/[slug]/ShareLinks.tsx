"use client";

import { useState } from "react";
import styles from "./article.module.css";

export function ShareLinks({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const text = encodeURIComponent(`${title} ${url}`);
  const u = encodeURIComponent(url);
  return (
    <div className={styles.share}>
      <span className={styles.shareLabel}>Share this story</span>
      <a href={`https://wa.me/?text=${text}`} target="_blank" rel="noopener noreferrer">
        WhatsApp
      </a>
      <a href={`https://x.com/intent/post?text=${text}`} target="_blank" rel="noopener noreferrer">
        X
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener noreferrer">
        Facebook
      </a>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          } catch {
            setCopied(false);
          }
        }}
      >
        <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
      </button>
    </div>
  );
}
