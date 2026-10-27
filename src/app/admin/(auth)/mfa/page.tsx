import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAccess } from "@/lib/admin/access";
import { MfaStep } from "./MfaStep";

export const metadata: Metadata = { title: "Two-step sign-in" };

export default async function MfaPage() {
  const s = await getAccess();
  if (s.state === "signed-out" || s.state === "no-access") redirect("/admin/login");
  if (s.state === "ok") redirect("/admin");
  return <MfaStep enrolled={s.enrolled} />;
}
