import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { unsubscribeAction } from "@/app/actions/newsletter-public";
import { Notice } from "@/components/page/Notice";
import { Button, ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };

// A button rather than an automatic unsubscribe, so email security scanners that open links
// can't take people off the list by accident.
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string; done?: string }> }) {
  const { token = "", done } = await searchParams;
  if (done) {
    return (
      <Notice title="You've been unsubscribed." body="You won't get any more newsletters from us. If you change your mind, you can sign up again at any time.">
        <ButtonLink href="/" variant="primary">
          Back to home
        </ButtonLink>
      </Notice>
    );
  }
  async function leave(fd: FormData) {
    "use server";
    await unsubscribeAction(fd);
    redirect("/newsletter/unsubscribe?done=1");
  }
  return (
    <Notice title="Unsubscribe from our newsletter?" body="We'll stop sending you stories from the field. You can sign up again whenever you like.">
      <form action={leave}>
        <input type="hidden" name="token" value={token} />
        <Button type="submit" variant="primary">
          Yes, unsubscribe me
        </Button>
      </form>
      <ButtonLink href="/" variant="ghost" arrow={false}>
        Keep me subscribed
      </ButtonLink>
    </Notice>
  );
}
