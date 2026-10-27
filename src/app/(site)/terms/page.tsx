import type { Metadata } from "next";
import { LegalArticle } from "@/components/page/LegalArticle";
import { getCopy } from "@/lib/copy";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCopy("terms");
  return { title: page.eyebrow, description: page.description, alternates: { canonical: "/terms" } };
}

export default async function TermsPage() {
  return <LegalArticle page={await getCopy("terms")} />;
}
