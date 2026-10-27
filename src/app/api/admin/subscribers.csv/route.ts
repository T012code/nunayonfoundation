import { can, getAccess } from "@/lib/admin/access";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const s = await getAccess();
  if (s.state !== "ok" || !can(s.access, "newsletter")) return new Response("Not allowed", { status: 403 });
  const supabase = await createClient();
  const { data } = await supabase.from("subscribers").select("email, status, created_at, confirmed_at, unsubscribed_at").order("created_at");
  const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [["Email", "Status", "Signed up", "Confirmed", "Unsubscribed"].map(cell).join(","), ...(data ?? []).map((r) => [r.email, r.status, r.created_at, r.confirmed_at, r.unsubscribed_at].map(cell).join(","))];
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nunayon-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
