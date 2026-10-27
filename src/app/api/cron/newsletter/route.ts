import { runScheduled } from "@/lib/newsletter";
import { serviceClient } from "@/lib/supabase/server";

// Called every few minutes by the database scheduler (pg_cron) to send scheduled newsletters
// and finish any that are part-way through. Protected by a shared secret.
export const maxDuration = 60;

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
  const db = serviceClient();
  if (!db) return new Response("Server key missing", { status: 503 });
  const sent = await runScheduled(db, 50_000);
  return Response.json({ sent });
}
