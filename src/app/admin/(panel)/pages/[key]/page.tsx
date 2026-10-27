import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHead, adminStyles as s } from "@/components/admin/ui";
import { COPY, COPY_PAGES, type CopyKey } from "@/content/copy";
import { requirePage } from "@/lib/admin/access";
import { getCopy } from "@/lib/copy";
import { CopyEditor } from "./CopyEditor";

export const metadata: Metadata = { title: "Edit page" };

export default async function PageEditor({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const page = COPY_PAGES.find((p) => p.key === key);
  if (!page) notFound();
  await requirePage("pages");
  const value = await getCopy(key as CopyKey);
  return (
    <div className={s.page}>
      <PageHead
        back={{ href: "/admin/pages", label: "Pages" }}
        title={page.title}
        lead={page.about}
        actions={
          <Link href={page.path} target="_blank" className={s.secondaryButton}>
            View page
          </Link>
        }
      />
      <CopyEditor pageKey={page.key} defaults={COPY[page.key]} value={value} />
    </div>
  );
}
