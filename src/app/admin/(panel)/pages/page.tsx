import type { Metadata } from "next";
import Link from "next/link";
import { Badge, PageHead, formatTime, adminStyles as s } from "@/components/admin/ui";
import { COPY_PAGES } from "@/content/copy";
import { requirePage } from "@/lib/admin/access";

export const metadata: Metadata = { title: "Pages" };

export default async function PagesAdmin() {
  const { supabase } = await requirePage("pages");
  const { data } = await supabase.from("page_content").select("slug, updated_at");
  const edited = new Map((data ?? []).map((r) => [r.slug as string, r.updated_at as string]));
  return (
    <div className={s.page}>
      <PageHead
        title="Pages"
        lead="The headings and words on every page of the site. Open a page to edit it; anything you haven't changed keeps its original text. Programmes, news, the gallery and board members have their own sections."
      />
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th scope="col">Page</th>
              <th scope="col">What you can edit</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {COPY_PAGES.map((p) => (
              <tr key={p.key}>
                <td>
                  <Link href={`/admin/pages/${p.key}`} className={s.rowLink}>
                    {p.title}
                  </Link>
                </td>
                <td className={`${s.small} ${s.muted}`}>{p.about}</td>
                <td className={`${s.small} ${s.nowrap}`}>
                  {edited.has(p.key) ? (
                    <Badge tone="green">Edited {formatTime(edited.get(p.key))}</Badge>
                  ) : (
                    <span className={s.muted}>Original</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
