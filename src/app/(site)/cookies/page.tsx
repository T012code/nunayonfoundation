import type { Metadata } from "next";
import { LegalArticle } from "@/components/page/LegalArticle";
import { cookies } from "@/content/legal";

export const metadata: Metadata = {
  title: cookies.eyebrow,
  description: cookies.description,
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return <LegalArticle page={cookies} />;
}
