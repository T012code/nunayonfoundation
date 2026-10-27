import type { Metadata } from "next";
import { LegalArticle } from "@/components/page/LegalArticle";
import { getCopy } from "@/lib/copy";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCopy("cookies");
  return { title: page.eyebrow, description: page.description, alternates: { canonical: "/cookies" } };
}

export default async function CookiesPage() {
  return <LegalArticle page={await getCopy("cookies")} />;
}
