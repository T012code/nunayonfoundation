import type { Metadata } from "next";
import Link from "next/link";
import { Empty, formatTime, PageHead, adminStyles as s } from "@/components/admin/ui";
import { requirePage } from "@/lib/admin/access";

export const metadata: Metadata = { title: "Activity log" };

type Row = { id: number; actor_email: string | null; action: string; entity: string; summary: string; created_at: string };

const ENTITY: Record<string, string> = {
  articles: "story",
  programmes: "programme",
  albums: "album",
  photos: "photo",
  people: "person",
  media: "photo upload",
  site_settings: "site settings",
  mail_settings: "email set-up",
  admins: "team member",
  submissions: "inbox item",
  subscribers: "subscriber",
  campaigns: "newsletter",
  session: "",
};

const PAGE = 100;

export default async function ActivityAdmin({ searchParams }: { searchParams: Promise<{ page?: string; who?: string }> }) {
  const params = await searchParams;
  const page = Math.max(0, Number(params.page) || 0);
  const { supabase } = await requirePage("activity");
  let q = supabase
    .from("activity_log")
    .select("id, actor_email, action, entity, summary, created_at")
    .order("created_at", { ascending: false })
    .range(page * PAGE, page * PAGE + PAGE);
  if (params.who) q = q.eq("actor_email", params.who);
  const { data } = await q;
  const rows = (data ?? []) as Row[];
  const more = rows.length > PAGE;
  const shown = rows.slice(0, PAGE);
  const qs = (p: number) => `/admin/activity?${new URLSearchParams({ ...(params.who ? { who: params.who } : {}), ...(p ? { page: String(p) } : {}) })}`;

  return (
    <div className={s.page}>
      <PageHead
        title="Activity log"
        lead={
          params.who ? (
            <>
              Showing changes by {params.who}.{" "}
              <Link href="/admin/activity" className={s.textLink}>
                Show everyone
              </Link>
            </>
          ) : (
            "Every sign-in and change made in the admin, newest first."
          )
        }
      />
      {shown.length ? (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th scope="col">When</th>
                <th scope="col">Who</th>
                <th scope="col">What</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id}>
                  <td className={`${s.small} ${s.muted} ${s.nowrap}`}>{formatTime(r.created_at)}</td>
                  <td className={s.small}>
                    {r.actor_email ? (
                      <Link href={`/admin/activity?who=${encodeURIComponent(r.actor_email)}`} className={s.textLink}>
                        {r.actor_email}
                      </Link>
                    ) : (
                      "System"
                    )}
                  </td>
                  <td className={s.small}>
                    <strong>{r.action[0].toUpperCase() + r.action.slice(1)}</strong> {ENTITY[r.entity] ?? r.entity}
                    {r.summary && r.entity !== "session" ? <span className={s.muted}> · {r.summary}</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>No activity yet.</Empty>
      )}
      <div className={s.actions}>
        {page > 0 ? (
          <Link href={qs(page - 1)} className={s.secondaryButton}>
            Newer
          </Link>
        ) : null}
        {more ? (
          <Link href={qs(page + 1)} className={s.secondaryButton}>
            Older
          </Link>
        ) : null}
      </div>
    </div>
  );
}
