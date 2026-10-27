"use server";

import { ActionError, requireAction } from "@/lib/admin/access";
import { run, type ActionResult } from "@/lib/admin/result";

export async function changePassword(_: unknown, fd: FormData): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAction();
    const password = String(fd.get("password") ?? "");
    if (password.length < 12) throw new ActionError("Use at least 12 characters.");
    if (password !== String(fd.get("confirm") ?? "")) throw new ActionError("The two passwords don't match.");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new ActionError(error.message);
    return { ok: true, message: "Password changed" };
  });
}
