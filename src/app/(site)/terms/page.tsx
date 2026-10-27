import type { Metadata } from "next";
import { LegalArticle } from "@/components/page/LegalArticle";
import { terms } from "@/content/legal";

export const metadata: Metadata = {
  title: terms.eyebrow,
  description: terms.description,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <LegalArticle page={terms} />;
}
