import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Empty, formatTime, PageHead, adminStyles as s } from "@/components/admin/ui";
import { requirePage } from "@/lib/admin/access";
import { KINDS, type Kind, type Submission } from "@/lib/admin/inbox";

export const metadata: Metadata = { title: "Inbox" };

const VIEWS = { open: "New & read", new: "New", archived: "Archived" } as const;
type View = keyof typeof VIEWS;

export default async function InboxAdmin({ searchParams }: { searchParams: Promise<{ view?: string; kind?: string }> }) {
  const params = await searchParams;
  const view: View = params.view && params.view in VIEWS ? (params.view as View) : "open";
  const kind = params.kind && params.kind in KINDS ? (params.kind as Kind) : null;
  const { supabase } = await requirePage("inbox");

  let q = supabase.from("submissions").select("id, kind, name, email, phone, fields, status, created_at").order("created_at", { ascending: false }).limit(300);
  q = view === "open" ? q.in("status", ["new", "read"]) : q.eq("status", view);
  if (kind) q = q.eq("kind", kind);
  const { data } = await q;
  const rows = (data ?? []) as Submission[];

  const href = (next: Partial<{ view: View; kind: Kind | null }>) => {
    const p = new URLSearchParams();
    const v = next.view ?? view;
    const k = next.kind === undefined ? kind : next.kind;
    if (v !== "open") p.set("view", v);
    if (k) p.set("kind", k);
    const qs = p.toString();
    return `/admin/inbox${qs ? `?${qs}` : ""}`;
  };
  const exportHref = `/api/admin/inbox.csv?${new URLSearchParams({ view, ...(kind ? { kind } : {}) })}`;

  return (
    <div className={s.page}>
      <PageHead
        title="Inbox"
        lead="Everything sent through the site's forms. Opening an item marks it as read."
        actions={
          <a href={exportHref} download className={s.secondaryButton}>
            Download CSV
          </a>
        }
      />
      <div className={s.toolbar}>
        <div className={s.tabs} role="group" aria-label="Status">
          {(Object.keys(VIEWS) as View[]).map((v) => (
            <Link key={v} href={href({ view: v })} className={s.tab} aria-current={view === v || undefined}>
              {VIEWS[v]}
            </Link>
          ))}
        </div>
        <div className={s.tabs} role="group" aria-label="Type">
          <Link href={href({ kind: null })} className={s.tab} aria-current={!kind || undefined}>
            All types
          </Link>
          {(Object.keys(KINDS) as Kind[]).map((k) => (
            <Link key={k} href={href({ kind: k })} className={s.tab} aria-current={kind === k || undefined}>
              {KINDS[k]}
            </Link>
          ))}
        </div>
      </div>
      {rows.length ? (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th scope="col">From</th>
                <th scope="col">Type</th>
                <th scope="col">About</th>
                <th scope="col">Received</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} data-unread={r.status === "new" || undefined} className={s.inboxRow}>
                  <td>
                    <Link href={`/admin/inbox/${r.id}`} className={s.rowLink}>
                      {r.name}
                    </Link>
                    <div className={`${s.small} ${s.muted}`}>{r.email}</div>
                  </td>
                  <td>
                    <span className={s.nowrap}>{KINDS[r.kind]}</span> {r.status === "new" ? <Badge tone="amber">New</Badge> : null}
                  </td>
                  <td className={`${s.small} ${s.muted} ${s.clip}`}>{r.fields[r.fields.length - 1]?.value ?? ""}</td>
                  <td className={`${s.small} ${s.muted} ${s.nowrap}`}>{formatTime(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>{view === "archived" ? "Nothing archived." : "All caught up. New form submissions will appear here."}</Empty>
      )}
    </div>
  );
}
