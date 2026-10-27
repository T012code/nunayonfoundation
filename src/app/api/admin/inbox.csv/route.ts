import { getAccess, can } from "@/lib/admin/access";
import { KINDS, type Kind, type Submission } from "@/lib/admin/inbox";
import { createClient } from "@/lib/supabase/server";

// CSV of the inbox view (for example, all volunteers) to open in Excel or Google Sheets.
export async function GET(request: Request) {
  const s = await getAccess();
  if (s.state !== "ok" || !can(s.access, "inbox")) return new Response("Not allowed", { status: 403 });
  const url = new URL(request.url);
  const view = url.searchParams.get("view") ?? "open";
  const kind = url.searchParams.get("kind");
  const supabase = await createClient();
  let q = supabase.from("submissions").select("*").order("created_at", { ascending: false }).limit(5000);
  q = view === "archived" || view === "new" ? q.eq("status", view) : q.in("status", ["new", "read"]);
  if (kind && kind in KINDS) q = q.eq("kind", kind);
  const rows = ((await q).data ?? []) as Submission[];

  const labels = [...new Set(rows.flatMap((r) => r.fields.map((f) => f.label)))];
  const header = ["Received", "Type", "Name", "Email", "Phone", ...labels, "Status"];
  // Quote every cell; neutralise leading = + - @ so spreadsheets don't run formulas.
  const cell = (v: string) => `"${(/^[=+\-@]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;
  const lines = [
    header.map(cell).join(","),
    ...rows.map((r) =>
      [
        new Date(r.created_at).toISOString().replace("T", " ").slice(0, 16),
        KINDS[r.kind as Kind],
        r.name,
        r.email,
        r.phone,
        ...labels.map((l) => r.fields.find((f) => f.label === l)?.value ?? ""),
        r.status,
      ]
        .map((v) => cell(String(v)))
        .join(","),
    ),
  ];
  const name = `nunayon-${kind ?? "inbox"}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response("﻿" + lines.join("\r\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${name}"`, "Cache-Control": "no-store" },
  });
}
