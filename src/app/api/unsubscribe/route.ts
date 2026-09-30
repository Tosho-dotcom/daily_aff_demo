/**
 * Verifies the signed unsubscribe link and forwards the request to n8n.
 *
 * Env (Vercel → Settings → Environment Variables):
 *   UNSUBSCRIBE_SECRET          signs/validates unsubscribe links (same value as in n8n when building links)
 *   N8N_UNSUBSCRIBE_WEBHOOK_URL e.g. https://tomn8nproject.space/webhook/softbloom-unsubscribe
 *   N8N_WEBHOOK_SECRET          shared header secret (already used by /api/subscribe)
 */

import { verifyUnsubscribeToken } from "@/lib/unsubscribe";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 254);
  const token = String(body.token ?? "").trim();

  if (!EMAIL_RE.test(email)) return Response.json({ ok: false, error: "invalid_link" }, { status: 400 });

  const signSecret = process.env.UNSUBSCRIBE_SECRET ?? "";
  if (!signSecret) {
    console.error("[unsubscribe] UNSUBSCRIBE_SECRET not set");
    return Response.json({ ok: false, error: "not_configured" }, { status: 500 });
  }
  if (!verifyUnsubscribeToken(email, token, signSecret)) {
    return Response.json({ ok: false, error: "invalid_link" }, { status: 403 });
  }

  const url = process.env.N8N_UNSUBSCRIBE_WEBHOOK_URL;
  if (!url) {
    console.error("[unsubscribe] N8N_UNSUBSCRIBE_WEBHOOK_URL not set");
    return Response.json({ ok: false, error: "not_configured" }, { status: 500 });
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-webhook-secret": process.env.N8N_WEBHOOK_SECRET ?? "" },
      body: JSON.stringify({ email, unsubscribedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(10_000),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return Response.json({ ok: false, error: "upstream", status: res.status }, { status: 502 });
    // "unsubscribed" or "not_found" – both mean this address will not receive emails.
    return Response.json({ ok: true, status: data?.status ?? "unsubscribed" });
  } catch {
    return Response.json({ ok: false, error: "upstream_unreachable" }, { status: 502 });
  }
}
