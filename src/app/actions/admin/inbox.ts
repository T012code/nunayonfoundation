"use server";

import { redirect } from "next/navigation";
import { requireAction } from "@/lib/admin/access";
import { check, run } from "@/lib/admin/result";

export async function setStatus(id: string, status: "new" | "read" | "archived") {
  return run(async () => {
    const { supabase } = await requireAction("inbox");
    check(await supabase.from("submissions").update({ status }).eq("id", id), "update");
    return { ok: true, message: status === "archived" ? "Archived" : status === "new" ? "Marked as new" : "Marked as read" };
  });
}

export async function deleteSubmission(id: string) {
  const result = await run(async () => {
    const { supabase } = await requireAction("inbox");
    check(await supabase.from("submissions").delete().eq("id", id), "delete");
  });
  if (result.ok) redirect("/admin/inbox");
  return result;
}
