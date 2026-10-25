"use client";

import { scrollToTop } from "@/lib/scroll";
import styles from "./SiteFooter.module.css";

export function BackToTop() {
  return (
    <button type="button" onClick={scrollToTop}>
      Back to top
      <span className={styles.topIcon} aria-hidden="true">
        <svg viewBox="0 0 16 16">
          <path d="M8 13V3.5M3.5 8 8 3.5 12.5 8" />
        </svg>
      </span>
    </button>
  );
}
