import type { Metadata } from "next";
import { PageHead, adminStyles as s } from "@/components/admin/ui";
import { redirect } from "next/navigation";
import { can, requirePage } from "@/lib/admin/access";
import { mediaUsage, toRef, type MediaRow } from "@/lib/admin/media";
import { serviceClient } from "@/lib/supabase/server";
import { MediaLibrary, type LibraryItem } from "./MediaLibrary";

export const metadata: Metadata = { title: "Media" };

export default async function MediaPage() {
  const { access, supabase } = await requirePage();
  if (!(["news", "gallery", "programmes", "people", "settings"] as const).some((p) => can(access, p))) {
    redirect("/admin?denied=1");
  }
  const [{ data }, usage] = await Promise.all([
    supabase.from("media").select("id, width, height, sizes, bytes, blur, alt, format, name, created_at").order("created_at", { ascending: false }),
    mediaUsage(serviceClient() ?? supabase),
  ]);
  const rows = (data ?? []) as (MediaRow & { created_at: string })[];
  const items: LibraryItem[] = rows.map((m) => ({
    ref: toRef(m),
    name: m.name,
    bytes: m.bytes,
    format: m.format,
    created: m.created_at,
    usage: usage.get(m.id) ?? [],
  }));
  const total = rows.reduce((n, m) => n + m.bytes, 0);

  return (
    <div className={s.page}>
      <PageHead
        title="Media"
        lead="Every photo uploaded to the site. Photos are compressed in your browser before upload, so storage goes further. A photo can only be deleted once nothing on the site uses it."
      />
      <MediaLibrary items={items} totalBytes={total} />
    </div>
  );
}
