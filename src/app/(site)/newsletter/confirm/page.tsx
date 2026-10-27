import type { Metadata } from "next";
import { confirmSubscription } from "@/app/actions/newsletter-public";
import { Notice } from "@/components/page/Notice";
import { ButtonLink } from "@/components/ui/Button";
import { getCopy } from "@/lib/copy";

export const metadata: Metadata = { title: "Confirm subscription", robots: { index: false, follow: false } };

export default async function ConfirmPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const [ok, copy] = await Promise.all([confirmSubscription(token), getCopy("site")]);
  const t = copy.newsletter;
  return ok ? (
    <Notice title={t.confirmedTitle} body={t.confirmedBody}>
      <ButtonLink href="/news" variant="primary">
        {copy.thanks.newsletter.button}
      </ButtonLink>
    </Notice>
  ) : (
    <Notice title={t.failedTitle} body={t.failedBody}>
      <ButtonLink href="/" variant="primary">
        Back to home
      </ButtonLink>
    </Notice>
  );
}
