import type { Metadata } from "next";
import { Gallery } from "@/components/gallery/Gallery";
import { CtaBand } from "@/components/page/CtaBand";
import { PageHero } from "@/components/page/PageHero";
import { getAlbums } from "@/lib/content";
import b from "@/components/page/blocks.module.css";
import { getCopy } from "@/lib/copy";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos from Nunayon Foundation outreaches: back to school, health days, skills training, food relief and clean water.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const [albums, c] = await Promise.all([getAlbums(), getCopy("gallery")]);
  return (
    <>
      <PageHero {...c.hero} />
      <section className={b.section} style={{ paddingTop: 0 }} aria-label="Photos">
        <div className="wrap">
          <Gallery albums={albums} />
        </div>
      </section>
      <CtaBand title={c.cta.title} body={c.cta.body} />
    </>
  );
}
