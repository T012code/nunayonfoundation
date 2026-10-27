import type { Metadata } from "next";
import { PageHead, adminStyles as s } from "@/components/admin/ui";
import { requirePage } from "@/lib/admin/access";
import { PeopleForm, type PersonValue } from "./PeopleForm";

export const metadata: Metadata = { title: "People" };

export default async function PeopleAdmin() {
  const { supabase } = await requirePage("people");
  const { data } = await supabase.from("people").select("id, name, role, bio, image, published").order("sort");
  return (
    <div className={s.page}>
      <PageHead title="People" lead="The founder, trustees and team on the About page, in this order. Without a photo, a person's initials are shown." />
      <PeopleForm people={(data ?? []) as PersonValue[]} />
    </div>
  );
}
