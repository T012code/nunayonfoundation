import "server-only";

/**
 * Checks the Cloudflare Turnstile token sent with a form. Until the keys are set
 * (TURNSTILE_SECRET_KEY and NEXT_PUBLIC_TURNSTILE_SITE_KEY), forms rely on the hidden
 * honeypot field alone.
 */
export async function verifyTurnstile(token: string | null, ip: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = (await res.json()) as { success: boolean };
    return data.success;
  } catch {
    return false;
  }
}

/**
 * Asks Cloudflare whether the secret key is real, using a dummy token: a real secret is told
 * the token is wrong; a wrong secret is told the secret is wrong. Null when not set or unreachable.
 */
export async function turnstileSecretWorks(): Promise<boolean | null> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: "check" }),
      next: { revalidate: 3600 },
    });
    const data = (await res.json()) as { "error-codes"?: string[] };
    return !(data["error-codes"] ?? []).some((c) => c.includes("secret"));
  } catch {
    return null;
  }
}
