"use server";

import { publicClient } from "@/lib/supabase/server";

// The links in newsletter emails. Each goes through a small database function that needs the
// subscriber's secret token, so they work from the public site without the server key.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function call(fn: "newsletter_confirm" | "newsletter_unsubscribe" | "newsletter_resubscribe", token: string) {
  if (!UUID.test(token)) return false;
  const { data, error } = await publicClient().rpc(fn, { p_token: token });
  return !error && data === true;
}

/** Who a link belongs to (address partly hidden) and whether they're on the list. */
export async function lookupSubscriber(token: string) {
  if (!UUID.test(token)) return null;
  const { data, error } = await publicClient().rpc("newsletter_lookup", { p_token: token });
  if (error || !data) return null;
  return data as { email: string; status: "pending" | "confirmed" | "unsubscribed" };
}

/** Confirms a subscription from the emailed link (already confirmed counts as success). */
export async function confirmSubscription(token: string) {
  return call("newsletter_confirm", token);
}

/** Takes an address off the list. Used by the unsubscribe page and the one-click header. */
export async function unsubscribe(token: string) {
  return call("newsletter_unsubscribe", token);
}

export async function unsubscribeAction(fd: FormData) {
  return unsubscribe(String(fd.get("token") ?? ""));
}

/** Puts someone who unsubscribed back on the list, from the same link. */
export async function resubscribeAction(fd: FormData) {
  return call("newsletter_resubscribe", String(fd.get("token") ?? ""));
}
