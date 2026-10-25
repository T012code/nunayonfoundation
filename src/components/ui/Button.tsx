import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Arrow } from "./Arrow";
import styles from "./Button.module.css";

type Variant = "cta" | "primary" | "paper" | "ghost" | "inverse";

function cls(variant: Variant, extra?: string) {
  return [styles.button, styles[variant], extra].filter(Boolean).join(" ");
}

export function ButtonLink({
  variant = "primary",
  arrow = true,
  className,
  children,
  ...props
}: { variant?: Variant; arrow?: boolean; children: ReactNode } & Omit<ComponentProps<typeof Link>, "children">) {
  return (
    <Link className={cls(variant, className)} {...props}>
      <span>{children}</span>
      {arrow ? <Arrow className={styles.arrow} /> : null}
    </Link>
  );
}

export function Button({
  variant = "primary",
  arrow = false,
  loading,
  className,
  children,
  disabled,
  ...props
}: { variant?: Variant; arrow?: boolean; loading?: boolean; children: ReactNode } & Omit<ComponentProps<"button">, "children">) {
  return (
    <button
      className={cls(variant, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      {...props}
    >
      <span>{children}</span>
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : arrow ? <Arrow className={styles.arrow} /> : null}
    </button>
  );
}
