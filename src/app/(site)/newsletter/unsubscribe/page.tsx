import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { lookupSubscriber, resubscribeAction, unsubscribeAction } from "@/app/actions/newsletter-public";
import { Notice } from "@/components/page/Notice";
import { Button, ButtonLink } from "@/components/ui/Button";
import { fill, getCopy } from "@/lib/copy";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };

type Params = { token?: string; done?: string; back?: string; failed?: string };

const page = (token: string, state?: "done" | "back" | "failed") =>
  `/newsletter/unsubscribe?${new URLSearchParams({ token, ...(state ? { [state]: "1" } : {}) })}`;

/**
 * Where the Unsubscribe link in every newsletter leads. It asks first, with a button, rather
 * than unsubscribing on opening, so email security scanners that open links can't take people
 * off the list by accident. Afterwards one click puts them back.
 */
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<Params> }) {
  const { token = "", done, back, failed } = await searchParams;
  const [copy, who] = await Promise.all([getCopy("site"), lookupSubscriber(token)]);
  const t = copy.newsletter;
  const email = { email: who?.email ?? "your address" };

  if (!who || failed) {
    return (
      <Notice title={t.brokenTitle} body={t.brokenBody}>
        <ButtonLink href="/contact" variant="primary">
          Contact us
        </ButtonLink>
        <ButtonLink href="/" variant="ghost" arrow={false}>
          Back to home
        </ButtonLink>
      </Notice>
    );
  }

  async function leave(fd: FormData) {
    "use server";
    const ok = await unsubscribeAction(fd);
    redirect(page(String(fd.get("token")), ok ? "done" : "failed"));
  }

  async function rejoin(fd: FormData) {
    "use server";
    const ok = await resubscribeAction(fd);
    redirect(page(String(fd.get("token")), ok ? "back" : undefined));
  }

  const rejoinForm = (
    <form action={rejoin}>
      <input type="hidden" name="token" value={token} />
      <Button type="submit" variant="primary">
        {t.resubscribeButton}
      </Button>
    </form>
  );

  if (back && who.status === "confirmed") {
    return (
      <Notice title={t.welcomeBackTitle} body={fill(t.welcomeBackBody, email)}>
        <ButtonLink href="/news" variant="primary">
          {copy.thanks.newsletter.button}
        </ButtonLink>
      </Notice>
    );
  }

  if (who.status === "unsubscribed") {
    return (
      <Notice title={done ? t.unsubscribedTitle : t.alreadyTitle} body={fill(done ? t.unsubscribedBody : t.alreadyBody, email)}>
        {rejoinForm}
        <ButtonLink href="/" variant="ghost" arrow={false}>
          Back to home
        </ButtonLink>
      </Notice>
    );
  }

  return (
    <Notice title={t.unsubscribeTitle} body={fill(t.unsubscribeBody, email)}>
      <form action={leave}>
        <input type="hidden" name="token" value={token} />
        <Button type="submit" variant="primary">
          {t.unsubscribeButton}
        </Button>
      </form>
      <ButtonLink href="/" variant="ghost" arrow={false}>
        {t.keepButton}
      </ButtonLink>
    </Notice>
  );
}
