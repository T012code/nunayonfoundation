import type { Metadata } from "next";
import { LegalArticle } from "@/components/page/LegalArticle";
import { privacy } from "@/content/legal";

export const metadata: Metadata = {
  title: privacy.eyebrow,
  description: privacy.description,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <LegalArticle page={privacy} />;
}
