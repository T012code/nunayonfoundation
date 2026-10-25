import type { CSSProperties, ReactNode } from "react";

type Variant = "up" | "unveil" | "draw" | "pop" | "words";

/**
 * Marks content to animate in when it first scrolls into view (see the Motion section of
 * globals.css; MotionRoot sets data-inview). Without JavaScript everything shows normally.
 */
export function Reveal({
  children,
  variant = "up",
  delay = 0,
  className,
  as: Tag = "div",
  style,
}: {
  children?: ReactNode;
  variant?: Variant;
  /** Seconds. */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "article" | "span" | "figure" | "p";
  style?: CSSProperties;
}) {
  return (
    <Tag
      data-reveal={variant}
      className={className}
      style={{ ...style, "--delay": `${Math.round(delay * 1000)}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
