import type { Metadata } from "next";
import Link from "next/link";
import { Badge, PageHead, adminStyles as s, formatDate } from "@/components/admin/ui";
import { requirePage } from "@/lib/admin/access";
import { EMAILS, GROUPS, TEMPLATE_KEYS } from "@/lib/email-templates";
import { EmailTabs } from "../EmailTabs";

export const metadata: Metadata = { title: "Email templates" };

export default async function EmailTemplates() {
  const { supabase } = await requirePage("manage");
  const { data } = await supabase.from("email_templates").select("key, enabled, updated_at");
  const saved = new Map((data ?? []).map((r) => [r.key as string, r as { enabled: boolean; updated_at: string }]));

  return (
    <div className={s.page}>
      <PageHead title="Email" lead="The wording of every email the site sends. Each one uses the same letterhead as the newsletter." />
      <EmailTabs current="/admin/email/templates" />
      {GROUPS.map((group) => {
        const keys = TEMPLATE_KEYS.filter((k) => EMAILS[k].group === group);
        if (!keys.length) return null;
        return (
          <section key={group} className={s.card}>
            <h2 className={s.cardTitle}>{group}</h2>
            <ul className={s.templateList}>
              {keys.map((k) => {
                const def = EMAILS[k];
                const row = saved.get(k);
                const off = "optional" in def && row && !row.enabled;
                return (
                  <li key={k}>
                    <Link href={`/admin/email/templates/${k}`} className={s.templateRow}>
                      <span>
                        <strong>{def.label}</strong>
                        <span className={`${s.small} ${s.muted}`}>{def.when}</span>
                      </span>
                      <span className={s.templateMeta}>
                        {off ? <Badge tone="amber">Off</Badge> : "optional" in def ? <Badge tone="green">On</Badge> : null}
                        {row ? <span className={`${s.small} ${s.muted}`}>Edited {formatDate(row.updated_at)}</span> : <span className={`${s.small} ${s.muted}`}>Original wording</span>}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
