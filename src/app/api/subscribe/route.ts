/**
 * Server-side proxy to the n8n webhook.
 * Keeps the webhook URL and shared secret out of the browser and avoids CORS setup on n8n.
 *
 * Env (set in Vercel → Project → Settings → Environment Variables):
 *   N8N_WEBHOOK_URL     e.g. https://tomn8nproject.space/webhook/softbloom-subscribe
 *   N8N_WEBHOOK_SECRET  any long random string; the same value is checked in n8n
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: real users never fill this hidden field.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return Response.json({ ok: true });
  }

  const name = String(body.name ?? "").trim().slice(0, 60);
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 254);
  const consent = body.consent === true;

  if (!name) return Response.json({ ok: false, error: "name_required" }, { status: 422 });
  if (!EMAIL_RE.test(email)) return Response.json({ ok: false, error: "email_invalid" }, { status: 422 });
  if (!consent) return Response.json({ ok: false, error: "consent_required" }, { status: 422 });

  const url = process.env.N8N_WEBHOOK_URL;
  const secret = process.env.N8N_WEBHOOK_SECRET ?? "";

  if (!url) {
    // Local/demo mode: no webhook configured yet.
    console.warn("[subscribe] N8N_WEBHOOK_URL not set – skipping forward", { email });
    return Response.json({ ok: true, demo: true });
  }

  const payload = {
    name,
    email,
    consent,
    timezone: String(body.timezone ?? "").slice(0, 64),
    locale: String(body.locale ?? "").slice(0, 16),
    source: String(body.source ?? "Softbloom app").slice(0, 64),
    country: request.headers.get("x-vercel-ip-country") ?? "",
    userAgent: (request.headers.get("user-agent") ?? "").slice(0, 200),
    submittedAt: new Date().toISOString(),
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-webhook-secret": secret },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return Response.json({ ok: false, error: "upstream", status: res.status }, { status: 502 });
    }
    return Response.json({ ok: true, status: data?.status ?? "created" });
  } catch {
    return Response.json({ ok: false, error: "upstream_unreachable" }, { status: 502 });
  }
}
