import type { Metadata } from "next";
import { Gallery } from "@/components/gallery/Gallery";
import { CtaBand } from "@/components/page/CtaBand";
import { PageHero } from "@/components/page/PageHero";
import { getAlbums } from "@/lib/content";
import b from "@/components/page/blocks.module.css";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos from Nunayon Foundation outreaches: back to school, health days, skills training, food relief and clean water.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const albums = await getAlbums();
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Moments from our outreaches."
        lead="Choose an album, or open any photo to see it full size. Use the arrow keys or swipe to move between photos."
      />
      <section className={b.section} style={{ paddingTop: 0 }} aria-label="Photos">
        <div className="wrap">
          <Gallery albums={albums} />
        </div>
      </section>
      <CtaBand title="Be part of the next photo." body="Join us at an outreach as a volunteer, or give so the next one can happen." />
    </>
  );
}
