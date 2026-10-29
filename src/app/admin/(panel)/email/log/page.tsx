import type { Metadata } from "next";
import Link from "next/link";
import { Empty, PageHead, adminStyles as s } from "@/components/admin/ui";
import { Pager } from "@/components/admin/Pager";
import { requirePage } from "@/lib/admin/access";
import { EMAILS, isTemplateKey } from "@/lib/email-templates";
import { EmailTabs } from "../EmailTabs";
import { LogTable, type LogEntry } from "./LogTable";

export const metadata: Metadata = { title: "Sent emails" };

const PAGE = 25;

// Emails that aren't templates (they're written elsewhere).
const OTHER: Record<string, string> = { newsletter_test: "Newsletter test", other: "Other" };
const kindLabel = (k: string) => (isTemplateKey(k) ? EMAILS[k].label : (OTHER[k] ?? k));

type Params = { page?: string; status?: string; kind?: string };

export default async function EmailLog({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const page = Math.max(1, Math.floor(Number(params.page)) || 1);
  const status = params.status === "failed" || params.status === "sent" ? params.status : "";
  const kind = params.kind ?? "";
  const { supabase } = await requirePage("manage");

  let q = supabase
    .from("email_log")
    .select("id, created_at, kind, to_address, subject, status, error", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE, page * PAGE - 1);
  if (status) q = q.eq("status", status);
  if (kind) q = q.eq("kind", kind);
  const [{ data, count }, { data: settings }] = await Promise.all([
    q,
    supabase.from("site_settings").select("email_log_days").maybeSingle<{ email_log_days: number }>(),
  ]);
  const rows = ((data ?? []) as Omit<LogEntry, "label">[]).map((r) => ({ ...r, label: kindLabel(r.kind) }));
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const filtered = !!(status || kind);
  const href = (p: number) => {
    const sp = new URLSearchParams();
    if (status) sp.set("status", status);
    if (kind) sp.set("kind", kind);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/admin/email/log${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className={s.page}>
      <PageHead
        title="Email"
        lead={`Every email the site has sent, newest first, kept for ${settings?.email_log_days ?? 90} days (change this in Settings). Newsletters are tracked on each newsletter instead.`}
      />
      <EmailTabs current="/admin/email/log" />

      <form className={s.toolbar} action="/admin/email/log" role="search" aria-label="Filter sent emails">
        <label className={s.field}>
          <span className={s.label}>Result</span>
          <select name="status" defaultValue={status} className={s.select}>
            <option value="">All</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </select>
        </label>
        <label className={s.field}>
          <span className={s.label}>Email</span>
          <select name="kind" defaultValue={kind} className={s.select}>
            <option value="">Every email</option>
            {[...Object.keys(EMAILS), ...Object.keys(OTHER)].map((k) => (
              <option key={k} value={k}>
                {kindLabel(k)}
              </option>
            ))}
          </select>
        </label>
        <div className={s.filterActions}>
          <button type="submit" className={s.secondaryButton}>
            Show
          </button>
          {filtered ? (
            <Link href="/admin/email/log" className={s.ghostButton}>
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      {rows.length ? (
        <LogTable rows={rows} total={total} first={(page - 1) * PAGE + 1} />
      ) : (
        <Empty>{filtered ? "Nothing matches these filters." : "No emails sent yet."}</Empty>
      )}
      {pages > 1 ? <Pager page={page} pages={pages} href={href} /> : null}
    </div>
  );
}
