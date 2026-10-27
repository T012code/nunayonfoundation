import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createBareClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/env";

/**
 * The signed-in team member's client. Every query runs as them, so the database's row-level
 * security decides what they can see and change.
 */
export async function createClient() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component, which can't set cookies; the proxy refreshes them.
        }
      },
    },
  });
}

/** Read-only client for public pages: no cookies, so pages stay static and cacheable. */
export function publicClient() {
  return createBareClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Full-access client for work the server does on its own behalf: saving form submissions,
 * newsletter sign-ups, sending email and creating team accounts. Never reaches the browser.
 * Returns null until SUPABASE_SECRET_KEY is set.
 */
export function serviceClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) return null;
  return createBareClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
