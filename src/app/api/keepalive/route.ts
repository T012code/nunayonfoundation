import { publicClient } from "@/lib/supabase/server";

// Called once a day by Vercel Cron (vercel.json). Free Supabase projects pause after a week
// without requests; this small read keeps the database awake. Vercel itself never sleeps.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
  const { error } = await publicClient().from("site_settings").select("id").limit(1);
  if (error) return Response.json({ ok: false, error: error.message }, { status: 502 });
  return Response.json({ ok: true, at: new Date().toISOString() });
}
