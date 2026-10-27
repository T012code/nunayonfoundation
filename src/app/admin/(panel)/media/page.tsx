import type { Metadata } from "next";
import { PageHead, adminStyles as s } from "@/components/admin/ui";
import { redirect } from "next/navigation";
import { can, requirePage } from "@/lib/admin/access";
import { mediaUsage, toRef, type MediaRow } from "@/lib/admin/media";
import { BUILTIN_IMAGES, builtinInfo } from "@/content/images";
import { serviceClient } from "@/lib/supabase/server";
import { MediaLibrary, type LibraryItem } from "./MediaLibrary";

export const metadata: Metadata = { title: "Media" };

export default async function MediaPage() {
  const { access, supabase } = await requirePage();
  if (!(["news", "gallery", "programmes", "people", "settings"] as const).some((p) => can(access, p))) {
    redirect("/admin?denied=1");
  }
  const [{ data }, usage] = await Promise.all([
    supabase
      .from("media")
      .select("id, width, height, sizes, bytes, blur, alt, format, name, created_at")
      .order("created_at", { ascending: false }),
    mediaUsage(serviceClient() ?? supabase),
  ]);
  const rows = (data ?? []) as (MediaRow & { created_at: string })[];
  const uploads: LibraryItem[] = rows.map((m) => ({
    key: m.id,
    kind: "upload",
    ref: toRef(m),
    name: m.name,
    alt: m.alt,
    width: m.width,
    height: m.height,
    sizes: m.sizes.length,
    bytes: m.bytes,
    format: m.format,
    created: m.created_at,
    usage: usage.get(m.id) ?? [],
  }));
  // Photos that ship with the site (placeholders and defaults).
  const builtins: LibraryItem[] = BUILTIN_IMAGES.map((slug) => {
    const info = builtinInfo(slug);
    return {
      key: slug,
      kind: "builtin",
      ref: slug,
      name: slug,
      alt: info.alt,
      width: info.width,
      height: info.height,
      sizes: info.sizes.length,
      bytes: 0,
      format: "webp",
      created: null,
      usage: usage.get(slug) ?? [],
    };
  });
  const items = [...uploads, ...builtins];
  const total = rows.reduce((n, m) => n + m.bytes, 0);

  return (
    <div className={s.page}>
      <PageHead
        title="Media"
        lead="Every photo on the site: the ones you upload and the photos built into the site. Uploads are compressed in your browser first, so storage goes further. An upload can only be deleted once nothing on the site uses it; built-in photos stay."
      />
      <MediaLibrary items={items} totalBytes={total} />
    </div>
  );
}
