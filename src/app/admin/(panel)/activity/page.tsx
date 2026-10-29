import type { Metadata } from "next";
import Link from "next/link";
import { Empty, formatTime, PageHead, adminStyles as s } from "@/components/admin/ui";
import { Pager } from "@/components/admin/Pager";
import { requirePage } from "@/lib/admin/access";

export const metadata: Metadata = { title: "Activity log" };

type Row = { id: number; actor_email: string | null; action: string; entity: string; summary: string; created_at: string };

const ENTITY: Record<string, string> = {
  articles: "story",
  programmes: "programme",
  albums: "album",
  photos: "photo",
  people: "board member",
  media: "photo upload",
  site_settings: "site settings",
  page_content: "page text",
  mail_settings: "email set-up",
  email_templates: "email wording",
  admins: "team member",
  submissions: "inbox item",
  subscribers: "subscriber",
  campaigns: "newsletter",
  session: "",
};

// What the "Type" filter offers, in the order people think of them.
const TYPES: { value: string; label: string }[] = [
  { value: "session", label: "Sign-ins and sign-outs" },
  { value: "page_content", label: "Page text" },
  { value: "articles", label: "News" },
  { value: "programmes", label: "Programmes" },
  { value: "albums,photos", label: "Gallery" },
  { value: "people", label: "Board members" },
  { value: "media", label: "Media uploads" },
  { value: "site_settings", label: "Site settings and home page" },
  { value: "submissions", label: "Inbox" },
  { value: "subscribers,campaigns", label: "Newsletter" },
  { value: "admins", label: "Team" },
  { value: "mail_settings,email_templates", label: "Email set-up and wording" },
];

const PAGE = 20;

type Params = { page?: string; who?: string; type?: string };

export default async function ActivityAdmin({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const page = Math.max(1, Math.floor(Number(params.page)) || 1);
  const who = params.who ?? "";
  const type = TYPES.some((t) => t.value === params.type) ? params.type! : "";
  const { supabase } = await requirePage("activity");

  let q = supabase
    .from("activity_log")
    .select("id, actor_email, action, entity, summary, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE, page * PAGE - 1);
  if (who) q = q.eq("actor_email", who);
  if (type) q = q.in("entity", type.split(","));
  const { data, count } = await q;
  const rows = (data ?? []) as Row[];
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));

  // People to filter by: the team (as far as this person may see it) plus anyone in the log.
  const [{ data: team }, { data: actors }, { data: settings }] = await Promise.all([
    supabase.from("admins").select("email, name").order("name"),
    supabase.from("activity_log").select("actor_email").not("actor_email", "is", null).order("created_at", { ascending: false }).limit(500),
    supabase.from("site_settings").select("activity_log_days").maybeSingle<{ activity_log_days: number }>(),
  ]);
  const days = settings?.activity_log_days ?? 14;
  const people = new Map<string, string>();
  for (const m of (team ?? []) as { email: string; name: string }[]) people.set(m.email, m.name || m.email);
  for (const a of (actors ?? []) as { actor_email: string }[]) if (!people.has(a.actor_email)) people.set(a.actor_email, a.actor_email);

  const href = (p: number) => {
    const sp = new URLSearchParams();
    if (who) sp.set("who", who);
    if (type) sp.set("type", type);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/admin/activity${qs ? `?${qs}` : ""}`;
  };
  const filtered = !!(who || type);
  const first = total ? (page - 1) * PAGE + 1 : 0;
  const last = Math.min(total, page * PAGE);

  return (
    <div className={s.page}>
      <PageHead title="Activity log" lead={`Every sign-in and change made in the admin, newest first. Entries older than ${days} days are cleared automatically (change this in Settings).`} />

      <form className={s.toolbar} action="/admin/activity" role="search" aria-label="Filter the activity log">
        <label className={s.field}>
          <span className={s.label}>Person</span>
          <select name="who" defaultValue={who} className={s.select}>
            <option value="">Everyone</option>
            {[...people].map(([email, name]) => (
              <option key={email} value={email}>
                {name === email ? email : `${name} (${email})`}
              </option>
            ))}
          </select>
        </label>
        <label className={s.field}>
          <span className={s.label}>Type</span>
          <select name="type" defaultValue={type} className={s.select}>
            <option value="">Everything</option>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <div className={s.filterActions}>
          <button type="submit" className={s.secondaryButton}>
            Show
          </button>
          {filtered ? (
            <Link href="/admin/activity" className={s.ghostButton}>
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      {rows.length ? (
        <>
          <p className={`${s.small} ${s.muted}`} aria-live="polite">
            {first}–{last} of {total} {filtered ? "matching entries" : "entries"}
          </p>
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
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className={`${s.small} ${s.muted} ${s.nowrap}`}>{formatTime(r.created_at)}</td>
                    <td className={s.small}>
                      {r.actor_email ? (
                        <Link href={`/admin/activity?who=${encodeURIComponent(r.actor_email)}`} className={s.textLink}>
                          {people.get(r.actor_email) ?? r.actor_email}
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
        </>
      ) : (
        <Empty>{filtered ? "Nothing matches these filters." : "No activity yet."}</Empty>
      )}

      {pages > 1 ? <Pager page={page} pages={pages} href={href} /> : null}
    </div>
  );
}
