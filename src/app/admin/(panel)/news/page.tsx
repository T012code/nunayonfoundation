import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/admin/Icon";
import { Badge, Empty, formatDate, PageHead, adminStyles as s } from "@/components/admin/ui";
import { thumbUrl, type ImageRef } from "@/content/images";
import { requirePage } from "@/lib/admin/access";
import { HOME_STORIES } from "@/lib/home";
import { deleteArticleInList, setFeatured } from "@/app/actions/admin/news";
import { RowDelete, RowSwitch } from "@/components/admin/RowActions";

export const metadata: Metadata = { title: "News" };

type Row = {
  id: string;
  title: string;
  slug: string;
  image: ImageRef | null;
  published: boolean;
  published_at: string | null;
  programme: string | null;
  featured: boolean;
};

export default async function NewsAdmin() {
  const { supabase } = await requirePage("news");
  const { data } = await supabase
    .from("articles")
    .select("id, title, slug, image, published, published_at, programme, featured")
    .order("published_at", { ascending: false, nullsFirst: true });
  const rows = (data ?? []) as Row[];
  const picked = rows.filter((r) => r.featured).length;

  return (
    <div className={s.page}>
      <PageHead
        title="News"
        lead="Stories from outreaches. Drafts stay private until you publish them."
        actions={
          <Link href="/admin/news/new" className={s.primaryButton}>
            <Icon name="plus" /> Write a story
          </Link>
        }
      />
      {rows.length ? (
        <>
          <p className={`${s.small} ${s.muted}`}>
            Home page: {picked} of {HOME_STORIES} picked.{" "}
            {picked < HOME_STORIES
              ? "The newest published stories fill the remaining places."
              : "Take one off to pick another."}
          </p>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th scope="col">Story</th>
                  <th scope="col">Status</th>
                  <th scope="col">Date</th>
                  <th scope="col">On home page</th>
                  <th scope="col">
                    <span className="visually-hidden">Delete</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className={s.rowMain}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={thumbUrl(r.image, 300)} alt="" className={s.thumb} loading="lazy" />
                        <Link href={`/admin/news/${r.id}`} className={s.rowLink}>
                          {r.title}
                        </Link>
                      </div>
                    </td>
                    <td>{r.published ? <Badge tone="green">Published</Badge> : <Badge>Draft</Badge>}</td>
                    <td className={`${s.small} ${s.muted} ${s.nowrap}`}>{formatDate(r.published_at)}</td>
                    <td>
                      <RowSwitch
                        on={r.featured}
                        label={`Show "${r.title}" on the home page`}
                        action={setFeatured.bind(null, r.id)}
                      />
                    </td>
                    <td className={s.rowEnd}>
                      <RowDelete label={`Delete "${r.title}"`} action={deleteArticleInList.bind(null, r.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <Empty>No stories yet. Write the first one.</Empty>
      )}
    </div>
  );
}
