import type { Metadata } from "next";
import { LegalArticle } from "@/components/page/LegalArticle";
import { getCopy } from "@/lib/copy";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCopy("privacy");
  return { title: page.eyebrow, description: page.description, alternates: { canonical: "/privacy" } };
}

export default async function PrivacyPage() {
  return <LegalArticle page={await getCopy("privacy")} />;
}
