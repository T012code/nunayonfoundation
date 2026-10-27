import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAccess } from "@/lib/admin/access";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const s = await getAccess();
  if (s.state === "ok") redirect("/admin");
  if (s.state === "needs-mfa") redirect("/admin/mfa");
  if (s.state === "no-access") {
    // Signed in, but not on the team: sign out so they can try another account.
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  return <LoginForm notice={s.state === "no-access" ? "no-access" : error} />;
}
