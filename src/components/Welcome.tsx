"use client";

import { useState } from "react";
import Link from "next/link";
import Bloom from "./Bloom";
import { APP } from "@/lib/config";
import { saveProfile, type Profile, type SubscribePayload } from "@/lib/storage";

const MESSAGES: Record<string, string> = {
  name_required: "Please tell us your first name.",
  email_invalid: "That email doesn't look quite right.",
  consent_required: "Please tick the box so we can send you your affirmations.",
};

export default function Welcome({ onDone }: { onDone: (p: Profile) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  // Honeypot for bots. Its name must not look like anything browsers autofill
  // (e.g. "company", "address", "name"), otherwise real users get flagged.
  const [trap, setTrap] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError(MESSAGES.name_required);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError(MESSAGES.email_invalid);
    if (!consent) return setError(MESSAGES.consent_required);

    const payload: SubscribePayload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      consent,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
      locale: navigator.language ?? "",
      source: `${APP.name} app`,
    };

    setBusy(true);
    let pending: SubscribePayload | null = null;
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, sb_trap: trap }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 422) {
        setBusy(false);
        return setError(MESSAGES[data.error] ?? "Please check your details.");
      }
      if (!res.ok) pending = payload; // server hiccup: let her in, retry later
    } catch {
      pending = payload; // offline: let her in, retry later
    }

    const profile: Profile = { name: payload.name, email: payload.email, joinedAt: new Date().toISOString() };
    saveProfile(profile, pending);
    onDone(profile);
  }

  return (
    <main className="screen welcome fade-in">
      <div className="welcome-head">
        <Bloom size={64} className="float" />
        <h1 className="brand">{APP.name}</h1>
        <p className="tagline">{APP.tagline}</p>
      </div>

      <form className="card form" onSubmit={submit} noValidate>
        <p className="form-intro">
          Start each day with a few kind words, chosen just for you. Where should we send new affirmations?
        </p>

        <label className="field">
          <span>First name</span>
          <input
            type="text" autoComplete="given-name" value={name} maxLength={60}
            onChange={(e) => setName(e.target.value)} placeholder="Ana"
          />
        </label>

        <label className="field">
          <span>Email</span>
          <input
            type="email" inputMode="email" autoComplete="email" value={email} maxLength={254}
            onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
          />
        </label>

        {/* honeypot – hidden from people and ignored by autofill/password managers */}
        <input
          type="text" className="hp" tabIndex={-1} aria-hidden="true"
          id="sb_trap_x" name="sb_trap_x" autoComplete="off"
          data-lpignore="true" data-1p-ignore="true" data-form-type="other"
          value={trap} onChange={(e) => setTrap(e.target.value)}
        />

        <label className="consent">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>
            I&rsquo;d like to receive affirmations and occasional gentle notes by email. I can unsubscribe
            anytime. <Link href="/privacy">Privacy</Link>
          </span>
        </label>

        {error && <p className="error" role="alert">{error}</p>}

        <button className="btn primary" type="submit" disabled={busy}>
          {busy ? "One moment…" : "Begin my morning ritual"}
        </button>
      </form>
    </main>
  );
}
