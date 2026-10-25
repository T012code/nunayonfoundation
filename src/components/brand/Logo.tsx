import type { SVGProps } from "react";
import { LOGO_FULL, LOGO_STACKED, MARK } from "./logo-paths";

const FILL = {
  ink: "var(--logo-ink)",
  shadow: "var(--logo-shadow)",
  leaf: "var(--logo-leaf)",
  tagline: "var(--logo-tagline)",
} as const;

type Variant = "stacked" | "full" | "mark";
const DATA = { stacked: LOGO_STACKED, full: LOGO_FULL, mark: MARK };

/**
 * The Nunayon logo as inline vector paths. Colours follow the --logo-* variables;
 * add the `logo-reversed` class on a dark background.
 */
export function Logo({ variant = "stacked", title = "Nunayon Foundation", ...props }: { variant?: Variant; title?: string } & SVGProps<SVGSVGElement>) {
  const { viewBox } = DATA[variant];
  const paths: readonly { role: keyof typeof FILL; d: string; transform?: string }[] = DATA[variant].paths;
  return (
    <svg viewBox={viewBox} role="img" aria-label={title} {...props}>
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill={FILL[p.role]} transform={p.transform} />
      ))}
    </svg>
  );
}
