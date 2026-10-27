import type { Metadata } from "next";
import { confirmSubscription } from "@/app/actions/newsletter-public";
import { Notice } from "@/components/page/Notice";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Confirm subscription", robots: { index: false, follow: false } };

export default async function ConfirmPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const ok = await confirmSubscription(token);
  return ok ? (
    <Notice
      title="You're on the list. Welcome."
      body="Thank you for confirming. You'll hear from us a few times a year with stories from our outreaches. Every email has a link to unsubscribe."
    >
      <ButtonLink href="/news" variant="primary">
        Read our latest stories
      </ButtonLink>
    </Notice>
  ) : (
    <Notice
      title="That link didn't work."
      body="It may have expired or been copied incompletely. Sign up again from the bottom of any page and we'll send a fresh link."
    >
      <ButtonLink href="/" variant="primary">
        Back to home
      </ButtonLink>
    </Notice>
  );
}
