import type { Metadata } from "next";
import Link from "next/link";
import { deleteAlbumInList, moveAlbum, setAlbumShown } from "@/app/actions/admin/gallery";
import { RowDelete, RowSwitch } from "@/components/admin/RowActions";
import { Icon } from "@/components/admin/Icon";
import { OrderButtons } from "@/components/admin/OrderButtons";
import { Empty, PageHead, adminStyles as s } from "@/components/admin/ui";
import { thumbUrl, type ImageRef } from "@/content/images";
import { requirePage } from "@/lib/admin/access";

export const metadata: Metadata = { title: "Gallery" };

type Row = { id: string; title: string; published: boolean; photos: { image: ImageRef; sort: number }[] };

export default async function GalleryAdmin() {
  const { supabase } = await requirePage("gallery");
  const { data } = await supabase.from("albums").select("id, title, published, photos(image, sort)").order("sort");
  const rows = (data ?? []) as Row[];
  return (
    <div className={s.page}>
      <PageHead
        title="Gallery"
        lead="Albums on the gallery page, in this order. Switch an album off to hide it from the site without deleting it. Open an album to add photos, write captions and arrange them."
        actions={
          <Link href="/admin/gallery/new" className={s.primaryButton}>
            <Icon name="plus" /> New album
          </Link>
        }
      />
      {rows.length ? (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th scope="col">Album</th>
                <th scope="col">Shown on site</th>
                <th scope="col">Order</th>
                <th scope="col">
                  <span className="visually-hidden">Delete</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const cover = [...r.photos].sort((a, b) => a.sort - b.sort)[0]?.image ?? null;
                return (
                  <tr key={r.id}>
                    <td>
                      <div className={s.rowMain}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={thumbUrl(cover, 300)} alt="" className={s.thumb} loading="lazy" />
                        <div>
                          <Link href={`/admin/gallery/${r.id}`} className={s.rowLink}>
                            {r.title}
                          </Link>
                          <div className={`${s.small} ${s.muted}`}>
                            {r.photos.length} photo{r.photos.length === 1 ? "" : "s"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <RowSwitch
                        on={r.published}
                        label={`Show "${r.title}" on the gallery page`}
                        action={setAlbumShown.bind(null, r.id)}
                      />
                    </td>
                    <td>
                      <OrderButtons first={i === 0} last={i === rows.length - 1} move={moveAlbum.bind(null, r.id)} />
                    </td>
                    <td className={s.rowEnd}>
                      <RowDelete
                        label={`Delete the album "${r.title}" and its ${r.photos.length} photos`}
                        action={deleteAlbumInList.bind(null, r.id)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>No albums yet. Create one to start adding photos.</Empty>
      )}
    </div>
  );
}
