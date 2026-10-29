import type { Metadata } from "next";
import Link from "next/link";
import { adminStyles as s, Badge, Card, Empty, formatTime, Notice, PageHead } from "@/components/admin/ui";
import { can, requirePage } from "@/lib/admin/access";
import { turnstileSecretWorks } from "@/lib/turnstile";
import { serviceClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard" };

const KIND: Record<string, string> = { contact: "Message", partner: "Partnership", volunteer: "Volunteer", donation: "Donation" };

type Row = { id: string; kind: string; name: string; status: string; created_at: string };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { denied } = await searchParams;
  const { access, supabase } = await requirePage();
  const has = (p: Parameters<typeof can>[1]) => can(access, p);
  const count = async (table: string, filter?: [string, string | boolean]) => {
    let q = supabase.from(table).select("id", { count: "exact", head: true });
    if (filter) q = q.eq(filter[0], filter[1]);
    const { count } = await q;
    return count ?? 0;
  };

  const [unread, subscribers, stories, photos, recent] = await Promise.all([
    has("inbox") ? count("submissions", ["status", "new"]) : null,
    has("newsletter") ? count("subscribers", ["status", "confirmed"]) : null,
    has("news") ? count("articles", ["published", true]) : null,
    has("gallery") ? count("photos") : null,
    has("inbox")
      ? supabase.from("submissions").select("id, kind, name, status, created_at").order("created_at", { ascending: false }).limit(6)
      : null,
  ]);

  // Set-up checklist for the super admin: what still needs configuring before launch.
  let checklist: { label: string; done: boolean; help: string }[] = [];
  if (access.role === "super_admin") {
    const db = serviceClient();
    const [mail, turnstile] = await Promise.all([
      db ? db.from("mail_settings").select("host, has_password").maybeSingle().then((r) => r.data) : null,
      turnstileSecretWorks(),
    ]);
    checklist = [
      { label: "Server key", done: !!db, help: "Add SUPABASE_SECRET_KEY in Vercel so forms, invitations and email work." },
      { label: "Outgoing email", done: !!(mail?.host && mail.has_password), help: "Connect the foundation's mailbox in Email set-up." },
      {
        label: "Spam protection",
        done: turnstile !== false,
        help:
          process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
            ? "Cloudflare rejected TURNSTILE_SECRET_KEY. Copy the secret key again from Cloudflare → Turnstile into Vercel, then redeploy."
            : "Add the Cloudflare Turnstile keys in Vercel.",
      },
    ];
  }
  const todo = checklist.filter((c) => !c.done);

  const tiles = [
    unread !== null && { href: "/admin/inbox", value: unread, label: "New in the inbox" },
    subscribers !== null && { href: "/admin/newsletter", value: subscribers, label: "Newsletter subscribers" },
    stories !== null && { href: "/admin/news", value: stories, label: "Published stories" },
    photos !== null && { href: "/admin/gallery", value: photos, label: "Photos in the gallery" },
  ].filter((t) => !!t);

  return (
    <div className={s.page}>
      <PageHead title={`Welcome, ${(access.name || access.email).split(" ")[0]}`} lead="Here's what's happening across the site." />

      {denied ? <Notice tone="error">You don&apos;t have permission to open that page. Ask the super admin if you need it.</Notice> : null}

      {todo.length ? (
        <Notice>
          <strong>Before launch</strong>
          {todo.map((t) => (
            <span key={t.label}>
              {t.label}: {t.help}
            </span>
          ))}
        </Notice>
      ) : null}

      {tiles.length ? (
        <div className={s.grid4}>
          {tiles.map((t) => (
            <Link key={t.href} href={t.href} className={s.tile}>
              <span className={s.tileValue}>{t.value.toLocaleString("en-NG")}</span>
              <span className={s.tileLabel}>{t.label}</span>
            </Link>
          ))}
        </div>
      ) : null}

      <div className={s.grid2}>
        {recent ? (
          <Card title="Latest in the inbox">
            {recent.data?.length ? (
              <table className={s.table}>
                <tbody>
                  {(recent.data as Row[]).map((r) => (
                    <tr key={r.id}>
                      <td>
                        <Link href={`/admin/inbox/${r.id}`} className={s.rowLink}>
                          {r.name}
                        </Link>
                        <div className={`${s.small} ${s.muted}`}>{KIND[r.kind]}</div>
                      </td>
                      <td className={`${s.small} ${s.muted} ${s.nowrap}`}>{formatTime(r.created_at)}</td>
                      <td>{r.status === "new" ? <Badge tone="amber">New</Badge> : null}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Empty>Nothing yet. Form submissions from the site will appear here.</Empty>
            )}
          </Card>
        ) : null}

      </div>
    </div>
  );
}
