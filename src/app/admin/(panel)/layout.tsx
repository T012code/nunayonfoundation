import { signOut } from "@/app/actions/admin/auth";
import { AdminShell, type NavGroup, type NavItem } from "@/components/admin/AdminShell";
import Link from "next/link";
import styles from "@/components/admin/admin.module.css";
import { can, isManager, requirePage, ROLE_LABELS } from "@/lib/admin/access";

// Every page in the panel is personal and always fresh.
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { access, supabase } = await requirePage();
  const has = (p: Parameters<typeof can>[1]) => can(access, p);
  const manager = isManager(access);

  const { data: site } = await supabase.from("site_settings").select("site_mode").maybeSingle<{ site_mode: string }>();
  const mode = site?.site_mode ?? "live";

  let unread = 0;
  if (has("inbox")) {
    const { count } = await supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "new");
    unread = count ?? 0;
  }

  const show = (yes: boolean, item: NavItem) => (yes ? [item] : []);
  const all: NavGroup[] = [
    { items: [{ href: "/admin", label: "Dashboard", icon: "home" }] },
    {
      label: "Content",
      items: [
        ...show(has("pages"), { href: "/admin/pages", label: "Pages", icon: "pages" }),
        ...show(has("settings"), { href: "/admin/homepage", label: "Homepage", icon: "layout" }),
        ...show(has("news"), { href: "/admin/news", label: "News", icon: "news" }),
        ...show(has("programmes"), { href: "/admin/programmes", label: "Programmes", icon: "programmes" }),
        ...show(has("gallery"), { href: "/admin/gallery", label: "Gallery", icon: "gallery" }),
        ...show(has("people"), { href: "/admin/people", label: "Board members", icon: "people" }),
        ...show(["pages", "news", "gallery", "programmes", "people", "settings"].some((p) => has(p as Parameters<typeof can>[1])), {
          href: "/admin/media",
          label: "Media",
          icon: "media",
        }),
      ],
    },
    {
      label: "Supporters",
      items: [
        ...show(has("inbox"), { href: "/admin/inbox", label: "Inbox", icon: "inbox", count: unread }),
        ...show(has("newsletter"), { href: "/admin/newsletter", label: "Newsletter", icon: "newsletter" }),
      ],
    },
    {
      label: "Site",
      items: [
        ...show(has("settings"), { href: "/admin/settings", label: "Site settings", icon: "settings" }),
        ...show(manager, { href: "/admin/site-status", label: "Site status", icon: "eye" }),
        ...show(manager, { href: "/admin/email", label: "Email", icon: "mail" }),
        ...show(manager, { href: "/admin/team", label: "Team & permissions", icon: "team" }),
        ...show(has("activity"), { href: "/admin/activity", label: "Activity log", icon: "activity" }),
      ],
    },
  ];
  const groups = all.filter((g) => g.items.length > 0);

  return (
    <AdminShell groups={groups} me={{ name: access.name, email: access.email, role: ROLE_LABELS[access.role] }} signOut={signOut}
      banner={
        mode !== "live" ? (
          <p className={styles.siteBanner} role="status">
            The public site is showing the {mode === "maintenance" ? "maintenance" : "coming soon"} page.{" "}
            {manager ? <Link href="/admin/site-status">Change site status</Link> : null}
          </p>
        ) : null
      }
    >
      {children}
    </AdminShell>
  );
}
