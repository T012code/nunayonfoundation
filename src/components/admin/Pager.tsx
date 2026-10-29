import Link from "next/link";
import styles from "./admin.module.css";

/** Previous / next plus page numbers (first, last and the pages around this one). */
export function Pager({ page, pages, href }: { page: number; pages: number; href: (p: number) => string }) {
  const nums: (number | "gap")[] = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 1) nums.push(p);
    else if (nums[nums.length - 1] !== "gap") nums.push("gap");
  }
  return (
    <nav className={styles.pager} aria-label="Pages">
      {page > 1 ? (
        <Link href={href(page - 1)} className={styles.pagerStep} rel="prev">
          ← Newer
        </Link>
      ) : (
        <span className={styles.pagerStep} aria-disabled="true">
          ← Newer
        </span>
      )}
      <ol>
        {nums.map((n, i) =>
          n === "gap" ? (
            <li key={`gap${i}`} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={n}>
              <Link href={href(n)} aria-current={n === page ? "page" : undefined} aria-label={`Page ${n}`}>
                {n}
              </Link>
            </li>
          ),
        )}
      </ol>
      {page < pages ? (
        <Link href={href(page + 1)} className={styles.pagerStep} rel="next">
          Older →
        </Link>
      ) : (
        <span className={styles.pagerStep} aria-disabled="true">
          Older →
        </span>
      )}
    </nav>
  );
}
