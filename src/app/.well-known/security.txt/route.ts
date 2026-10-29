import { getSettings } from "@/lib/content";
import { SITE_URL } from "@/lib/env";

// How to report a security problem (RFC 9116). Rebuilt daily so "Expires" always stays ahead.
export const revalidate = 86400;

export async function GET() {
  const { email } = await getSettings();
  const expires = new Date(Date.now() + 180 * 86400_000);
  expires.setUTCHours(0, 0, 0, 0);
  const body = [
    `Contact: mailto:${email}`,
    `Contact: ${SITE_URL}/contact`,
    `Expires: ${expires.toISOString()}`,
    "Preferred-Languages: en",
    `Canonical: ${SITE_URL}/.well-known/security.txt`,
    `Policy: ${SITE_URL}/privacy`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
