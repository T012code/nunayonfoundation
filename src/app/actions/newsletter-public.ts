"use server";

import { serviceClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Confirms a pending subscription from the emailed link. */
export async function confirmSubscription(token: string) {
  const db = serviceClient();
  if (!db || !UUID.test(token)) return false;
  const { data } = await db
    .from("subscribers")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString(), unsubscribed_at: null })
    .eq("token", token)
    .neq("status", "confirmed")
    .select("id");
  if (data?.length) return true;
  // Already confirmed counts as success.
  const { data: row } = await db.from("subscribers").select("status").eq("token", token).maybeSingle<{ status: string }>();
  return row?.status === "confirmed";
}

/** Takes an address off the list. Used by the unsubscribe page and the one-click header. */
export async function unsubscribe(token: string) {
  const db = serviceClient();
  if (!db || !UUID.test(token)) return false;
  // Success only when the link matched someone on the list (already unsubscribed counts).
  const { data, error } = await db
    .from("subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("token", token)
    .select("id");
  return !error && !!data?.length;
}

export async function unsubscribeAction(fd: FormData) {
  return unsubscribe(String(fd.get("token") ?? ""));
}
