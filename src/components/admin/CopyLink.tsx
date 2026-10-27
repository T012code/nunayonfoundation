"use client";

import { useState } from "react";
import styles from "./admin.module.css";

export function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={styles.copyRow}>
      <input className={styles.input} value={link} readOnly onFocus={(e) => e.currentTarget.select()} aria-label="Link" />
      <button
        type="button"
        className={styles.secondaryButton}
        onClick={async () => {
          await navigator.clipboard.writeText(link);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
