import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, formatTime, PageHead, adminStyles as s } from "@/components/admin/ui";
import { requirePage } from "@/lib/admin/access";
import { KINDS, type Submission } from "@/lib/admin/inbox";
import { InboxActions } from "./InboxActions";

export const metadata: Metadata = { title: "Inbox" };

export default async function InboxItem({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requirePage("inbox");
  const { data } = await supabase.from("submissions").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const item = data as Submission;
  // Opening it counts as reading it.
  if (item.status === "new") {
    await supabase.from("submissions").update({ status: "read" }).eq("id", id);
    item.status = "read";
  }
  const wa = item.phone.replace(/\D/g, "");
  const subject = `Re: your ${KINDS[item.kind].toLowerCase()} to Nunayon Foundation`;

  return (
    <div className={s.page}>
      <PageHead back={{ href: "/admin/inbox", label: "Inbox" }} title={item.name} lead={`${KINDS[item.kind]} · ${formatTime(item.created_at)}`} />
      <div className={s.grid2}>
        <Card title="Details">
          <dl className={s.dl}>
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${item.email}`} className={s.textLink}>
                  {item.email}
                </a>
              </dd>
            </div>
            {item.phone ? (
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${item.phone}`} className={s.textLink}>
                    {item.phone}
                  </a>
                </dd>
              </div>
            ) : null}
            {item.fields.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <Card title="Reply">
          <div className={s.fields}>
            <div className={s.actions}>
              <a href={`mailto:${item.email}?subject=${encodeURIComponent(subject)}`} className={s.primaryButton}>
                Reply by email
              </a>
              {wa ? (
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className={s.secondaryButton}>
                  WhatsApp
                </a>
              ) : null}
            </div>
            <InboxActions id={item.id} status={item.status} />
          </div>
        </Card>
      </div>
    </div>
  );
}
