import "server-only";
import { revalidatePath } from "next/cache";
import { ActionError } from "./access";

export type ActionResult = { ok: true; message?: string; id?: string } | { ok: false; error: string };

/** Runs an admin action, turning failures into a message the form can show. */
export async function run(fn: () => Promise<ActionResult | void>): Promise<ActionResult> {
  try {
    return (await fn()) ?? { ok: true };
  } catch (err) {
    if (err instanceof ActionError) return { ok: false, error: err.message };
    // Next's redirect() works by throwing; let it through.
    if (err && typeof err === "object" && "digest" in err && String((err as { digest: unknown }).digest).startsWith("NEXT_")) throw err;
    console.error("[admin]", err);
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong. Please try again." };
  }
}

/** Throws a readable error for a failed database call. */
export function check<T extends { error: { message: string; code?: string } | null }>(res: T, what = "save"): T {
  if (res.error) {
    if (res.error.code === "23505") throw new ActionError("That web address (slug) is already used. Choose another.");
    if (res.error.code === "42501") throw new ActionError("You don't have permission to do that.");
    throw new ActionError(`Couldn't ${what}: ${res.error.message}`);
  }
  return res;
}

/** Public pages are built ahead of time; rebuild them after content changes. */
export function refreshSite() {
  revalidatePath("/", "layout");
}
