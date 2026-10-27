import "server-only";

// Whether an email address's domain can receive mail, over DNS-over-HTTPS (works on any host).

async function lookup(name: string, type: "MX" | "A", timeout: number) {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`;
  const res = await fetch(url, { headers: { accept: "application/dns-json" }, cache: "no-store", signal: AbortSignal.timeout(timeout) });
  if (!res.ok) throw new Error(`DNS lookup failed (${res.status})`);
  const json = (await res.json()) as { Status: number; Answer?: { type: number; data: string }[] };
  return { status: json.Status, answers: (json.Answer ?? []).filter((a) => a.type === (type === "MX" ? 15 : 1)).map((a) => a.data) };
}

/**
 * True when the domain has a mail server (MX record) or at least an address (A record).
 * "0 ." is a null MX: the domain says it accepts no mail. If DNS itself can't be reached the
 * answer is yes, so a lookup outage never blocks a real visitor.
 */
export async function domainAcceptsMail(domain: string): Promise<boolean> {
  try {
    const mx = await lookup(domain, "MX", 3000);
    if (mx.answers.some((r) => !/^0\s+\.?$/.test(r.trim()))) return true;
    const a = await lookup(domain, "A", 3000);
    return a.answers.length > 0;
  } catch {
    return true;
  }
}
