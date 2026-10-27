import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHead, adminStyles as s } from "@/components/admin/ui";
import type { ImageRef } from "@/content/images";
import { requirePage } from "@/lib/admin/access";
import { ArticleForm, type ArticleValues } from "./ArticleForm";

export const metadata: Metadata = { title: "Story" };

export default async function ArticleAdmin({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const { supabase } = await requirePage("news");
  const { data: programmes } = await supabase.from("programmes").select("slug, title").order("sort");

  let values: ArticleValues = { title: "", slug: "", excerpt: "", body: "", image: null, photos: [], programme: "", published: false, published_at: null };
  if (id !== "new") {
    const { data } = await supabase.from("articles").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    values = { ...(data as ArticleValues), photos: (data.photos as ImageRef[]) ?? [] };
  }

  return (
    <div className={s.page}>
      <PageHead
        back={{ href: "/admin/news", label: "News" }}
        title={id === "new" ? "Write a story" : values.title}
        lead={values.published && id !== "new" ? <a href={`/news/${values.slug}`} target="_blank" rel="noopener noreferrer" className={s.textLink}>View on the site</a> : undefined}
      />
      <ArticleForm id={id === "new" ? null : id} values={values} programmes={(programmes ?? []) as { slug: string; title: string }[]} justSaved={!!saved} />
    </div>
  );
}
