import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHead, adminStyles as s } from "@/components/admin/ui";
import { requirePage } from "@/lib/admin/access";
import { getLetterhead, type Campaign } from "@/lib/newsletter";
import { CampaignForm } from "./CampaignForm";

export const metadata: Metadata = { title: "Newsletter" };

export default async function CampaignAdmin({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const { supabase, access } = await requirePage("newsletter");
  let campaign: Campaign | null = null;
  if (id !== "new") {
    const { data } = await supabase.from("campaigns").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    campaign = data as Campaign;
  }
  const [{ count }, head] = await Promise.all([
    supabase.from("subscribers").select("id", { count: "exact", head: true }).eq("status", "confirmed"),
    getLetterhead(),
  ]);
  return (
    <div className={s.page}>
      <PageHead back={{ href: "/admin/newsletter", label: "Newsletter" }} title={campaign?.subject ?? "Write a newsletter"} />
      <CampaignForm campaign={campaign} subscribers={count ?? 0} justSaved={!!saved} head={head} me={access.email} />
    </div>
  );
}
