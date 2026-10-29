"use server";

import { ActionError, requireAction } from "@/lib/admin/access";
import { str } from "@/lib/admin/form";
import { check, refreshSite, run, type ActionResult } from "@/lib/admin/result";

const MODES = ["live", "maintenance", "coming_soon"] as const;

/** Switches the public site between live, maintenance and coming soon. */
export async function saveSiteStatus(_: unknown, fd: FormData): Promise<ActionResult> {
  return run(async () => {
    const { supabase } = await requireAction("manage");
    const mode = str(fd, "site_mode", 20) as (typeof MODES)[number];
    if (!MODES.includes(mode)) throw new ActionError("Choose how the site should appear.");
    check(
      await supabase
        .from("site_settings")
        .update({
          site_mode: mode,
          mode_title: str(fd, "mode_title", 140),
          mode_message: str(fd, "mode_message", 600),
          mode_until: str(fd, "mode_until", 80),
        })
        .eq("id", true),
    );
    refreshSite();
    return {
      ok: true,
      message:
        mode === "live"
          ? "The site is live again. Visitors see it within a minute."
          : `Visitors now see the ${mode === "maintenance" ? "maintenance" : "coming soon"} page (within a minute). The admin keeps working.`,
    };
  });
}
