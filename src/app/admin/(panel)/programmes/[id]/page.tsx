import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHead, adminStyles as s } from "@/components/admin/ui";
import { requirePage } from "@/lib/admin/access";
import { ProgrammeForm, type ProgrammeValues } from "./ProgrammeForm";

export const metadata: Metadata = { title: "Programme" };

const EMPTY: ProgrammeValues = {
  title: "",
  slug: "",
  summary: "",
  intro: "",
  image: null,
  covers: [""],
  steps: [{ title: "", body: "" }],
  stat: { value: "", label: "" },
  photos: [],
  published: true,
};

export default async function ProgrammeAdmin({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const { supabase } = await requirePage("programmes");
  let values = EMPTY;
  if (id !== "new") {
    const { data } = await supabase.from("programmes").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    values = data as ProgrammeValues;
  }
  return (
    <div className={s.page}>
      <PageHead
        back={{ href: "/admin/programmes", label: "Programmes" }}
        title={id === "new" ? "Add a programme" : values.title}
        lead={id !== "new" && values.published ? <a href={`/programmes/${values.slug}`} target="_blank" rel="noopener noreferrer" className={s.textLink}>View on the site</a> : undefined}
      />
      <ProgrammeForm id={id === "new" ? null : id} values={values} justSaved={!!saved} />
    </div>
  );
}
