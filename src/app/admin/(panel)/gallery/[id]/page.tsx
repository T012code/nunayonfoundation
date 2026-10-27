import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHead, adminStyles as s } from "@/components/admin/ui";
import { requirePage } from "@/lib/admin/access";
import { AlbumForm, type AlbumValues } from "./AlbumForm";

export const metadata: Metadata = { title: "Album" };

export default async function AlbumAdmin({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const { supabase } = await requirePage("gallery");
  let values: AlbumValues = { title: "", slug: "", published: true, photos: [] };
  if (id !== "new") {
    const { data } = await supabase.from("albums").select("title, slug, published, photos(id, image, caption, sort)").eq("id", id).maybeSingle();
    if (!data) notFound();
    const photos = [...((data.photos ?? []) as (AlbumValues["photos"][number] & { sort: number })[])].sort((a, b) => a.sort - b.sort);
    values = { title: data.title, slug: data.slug, published: data.published, photos: photos.map(({ id, image, caption }) => ({ id, image, caption })) };
  }
  return (
    <div className={s.page}>
      <PageHead back={{ href: "/admin/gallery", label: "Gallery" }} title={id === "new" ? "New album" : values.title} />
      <AlbumForm id={id === "new" ? null : id} values={values} justSaved={!!saved} />
    </div>
  );
}
