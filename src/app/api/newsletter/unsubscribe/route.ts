import { unsubscribe } from "@/app/actions/newsletter-public";

// One-click unsubscribe (RFC 8058): mail apps POST here from the List-Unsubscribe header.
export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const ok = await unsubscribe(token);
  return new Response(ok ? "Unsubscribed" : "Not found", { status: ok ? 200 : 400 });
}
