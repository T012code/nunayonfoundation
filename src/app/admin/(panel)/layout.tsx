import { signOut } from "@/app/actions/admin/auth";
import { AdminShell, type NavGroup, type NavItem } from "@/components/admin/AdminShell";
import { can, requirePage, ROLE_LABELS } from "@/lib/admin/access";

// Every page in the panel is personal and always fresh.
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { access, supabase } = await requirePage();
  const has = (p: Parameters<typeof can>[1]) => can(access, p);
  const isSuper = access.role === "super_admin";

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
        ...show(has("news"), { href: "/admin/news", label: "News", icon: "news" }),
        ...show(has("programmes"), { href: "/admin/programmes", label: "Programmes", icon: "programmes" }),
        ...show(has("gallery"), { href: "/admin/gallery", label: "Gallery", icon: "gallery" }),
        ...show(has("people"), { href: "/admin/people", label: "People", icon: "people" }),
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
        ...show(isSuper, { href: "/admin/email", label: "Email set-up", icon: "mail" }),
        ...show(isSuper, { href: "/admin/team", label: "Team & permissions", icon: "team" }),
        ...show(has("activity"), { href: "/admin/activity", label: "Activity log", icon: "activity" }),
      ],
    },
  ];
  const groups = all.filter((g) => g.items.length > 0);

  return (
    <AdminShell groups={groups} me={{ name: access.name || access.email, role: ROLE_LABELS[access.role] }} signOut={signOut}>
      {children}
    </AdminShell>
  );
}
