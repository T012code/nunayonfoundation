import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/admin/Icon";
import { Badge, Empty, formatDate, formatTime, PageHead, adminStyles as s } from "@/components/admin/ui";
import { requirePage } from "@/lib/admin/access";
import type { Campaign } from "@/lib/newsletter";
import { SubscriberTools } from "./SubscriberTools";

export const metadata: Metadata = { title: "Newsletter" };

const STATUS: Record<Campaign["status"], { label: string; tone?: "green" | "amber" | "teal" }> = {
  draft: { label: "Draft" },
  scheduled: { label: "Scheduled", tone: "amber" },
  sending: { label: "Sending", tone: "teal" },
  sent: { label: "Sent", tone: "green" },
};

type Sub = { id: string; email: string; status: "pending" | "confirmed" | "unsubscribed"; created_at: string; confirmed_at: string | null };

export default async function NewsletterAdmin({ searchParams }: { searchParams: Promise<{ tab?: string; status?: string }> }) {
  const params = await searchParams;
  const tab = params.tab === "subscribers" ? "subscribers" : "campaigns";
  const { supabase } = await requirePage("newsletter");
  const counts = Object.fromEntries(
    await Promise.all(
      (["confirmed", "pending", "unsubscribed"] as const).map(async (st) => {
        const { count } = await supabase.from("subscribers").select("id", { count: "exact", head: true }).eq("status", st);
        return [st, count ?? 0] as const;
      }),
    ),
  ) as Record<Sub["status"], number>;

  return (
    <div className={s.page}>
      <PageHead
        title="Newsletter"
        lead={`${counts.confirmed} confirmed subscriber${counts.confirmed === 1 ? "" : "s"}. People join from the sign-up box on every page and confirm by email first.`}
        actions={
          <Link href="/admin/newsletter/new" className={s.primaryButton}>
            <Icon name="plus" /> Write a newsletter
          </Link>
        }
      />
      <div className={s.tabs} role="group" aria-label="Section">
        <Link href="/admin/newsletter" className={s.tab} aria-current={tab === "campaigns" || undefined}>
          Newsletters
        </Link>
        <Link href="/admin/newsletter?tab=subscribers" className={s.tab} aria-current={tab === "subscribers" || undefined}>
          Subscribers
        </Link>
      </div>
      {tab === "campaigns" ? <Campaigns supabase={supabase} /> : <Subscribers supabase={supabase} counts={counts} status={params.status} />}
    </div>
  );
}

type Db = Awaited<ReturnType<typeof requirePage>>["supabase"];

async function Campaigns({ supabase }: { supabase: Db }) {
  const { data } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false });
  const rows = (data ?? []) as (Campaign & { created_at: string })[];
  if (!rows.length) return <Empty>No newsletters yet. Write the first one.</Empty>;
  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            <th scope="col">Subject</th>
            <th scope="col">Status</th>
            <th scope="col">Sent to</th>
            <th scope="col">Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id}>
              <td>
                <Link href={`/admin/newsletter/${c.id}`} className={s.rowLink}>
                  {c.subject}
                </Link>
              </td>
              <td>
                <Badge tone={STATUS[c.status].tone}>{STATUS[c.status].label}</Badge>
              </td>
              <td className={s.small}>{c.status === "sent" || c.status === "sending" ? `${c.sent_count}${c.failed_count ? ` (${c.failed_count} failed)` : ""}` : "—"}</td>
              <td className={`${s.small} ${s.muted} ${s.nowrap}`}>
                {c.status === "scheduled" ? formatTime(c.scheduled_at) : formatDate(c.sent_at ?? c.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function Subscribers({ supabase, counts, status }: { supabase: Db; counts: Record<Sub["status"], number>; status?: string }) {
  const st = status === "pending" || status === "unsubscribed" ? status : "confirmed";
  const { data } = await supabase.from("subscribers").select("id, email, status, created_at, confirmed_at").eq("status", st).order("created_at", { ascending: false }).limit(1000);
  const rows = (data ?? []) as Sub[];
  const labels = { confirmed: "Confirmed", pending: "Waiting to confirm", unsubscribed: "Unsubscribed" };
  return (
    <>
      <div className={s.toolbar}>
        <div className={s.tabs} role="group" aria-label="Status">
          {(["confirmed", "pending", "unsubscribed"] as const).map((k) => (
            <Link key={k} href={`/admin/newsletter?tab=subscribers&status=${k}`} className={s.tab} aria-current={st === k || undefined}>
              {labels[k]} <span className={s.tabCount}>{counts[k]}</span>
            </Link>
          ))}
        </div>
        <a href="/api/admin/subscribers.csv" download className={s.secondaryButton}>
          Download CSV
        </a>
      </div>
      <SubscriberTools rows={rows} pendingCount={counts.pending} showResend={st === "pending"} />
    </>
  );
}
