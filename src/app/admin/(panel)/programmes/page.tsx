import type { Metadata } from "next";
import Link from "next/link";
import { moveProgramme } from "@/app/actions/admin/programmes";
import { Icon } from "@/components/admin/Icon";
import { OrderButtons } from "@/components/admin/OrderButtons";
import { Badge, Empty, PageHead, adminStyles as s } from "@/components/admin/ui";
import { thumbUrl, type ImageRef } from "@/content/images";
import { requirePage } from "@/lib/admin/access";

export const metadata: Metadata = { title: "Programmes" };

type Row = { id: string; title: string; summary: string; image: ImageRef | null; published: boolean };

export default async function ProgrammesAdmin() {
  const { supabase } = await requirePage("programmes");
  const { data } = await supabase.from("programmes").select("id, title, summary, image, published").order("sort").order("title");
  const rows = (data ?? []) as Row[];
  return (
    <div className={s.page}>
      <PageHead
        title="Programmes"
        lead="The programme pages, in the order they appear on the site."
        actions={
          <Link href="/admin/programmes/new" className={s.primaryButton}>
            <Icon name="plus" /> Add a programme
          </Link>
        }
      />
      {rows.length ? (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td>
                    <div className={s.rowMain}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={thumbUrl(r.image, 300)} alt="" className={s.thumb} loading="lazy" />
                      <div>
                        <Link href={`/admin/programmes/${r.id}`} className={s.rowLink}>
                          {r.title}
                        </Link>
                        <div className={`${s.small} ${s.muted}`}>{r.summary}</div>
                      </div>
                    </div>
                  </td>
                  <td>{r.published ? <Badge tone="green">Live</Badge> : <Badge>Hidden</Badge>}</td>
                  <td>
                    <OrderButtons first={i === 0} last={i === rows.length - 1} move={moveProgramme.bind(null, r.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>No programmes yet.</Empty>
      )}
    </div>
  );
}
