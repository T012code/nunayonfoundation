"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ActionResult } from "@/lib/admin/result";
import { Icon } from "./Icon";
import styles from "./admin.module.css";

/** Up and down buttons for list order, saved straight away. */
export function OrderButtons({
  first,
  last,
  move,
}: {
  first: boolean;
  last: boolean;
  move: (direction: -1 | 1) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const go = (d: -1 | 1) =>
    start(async () => {
      await move(d);
      router.refresh();
    });
  return (
    <div className={styles.iconRow}>
      <button type="button" className={styles.iconButton} disabled={first || pending} onClick={() => go(-1)} aria-label="Move up">
        <Icon name="up" />
      </button>
      <button type="button" className={styles.iconButton} disabled={last || pending} onClick={() => go(1)} aria-label="Move down">
        <Icon name="down" />
      </button>
    </div>
  );
}
