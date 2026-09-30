"use client";

import { useState } from "react";
import Link from "next/link";
import Bloom from "./Bloom";
import { APP } from "@/lib/config";

type State = "confirm" | "busy" | "done" | "invalid" | "error";

/**
 * A confirmation click is required on purpose: email security scanners open links
 * automatically, and a plain GET would unsubscribe people without their knowledge.
 */
export default function Unsubscribe({ email, token }: { email: string; token: string }) {
  const [state, setState] = useState<State>(email && token ? "confirm" : "invalid");

  async function confirm() {
    setState("busy");
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) return setState("done");
      setState(data.error === "invalid_link" ? "invalid" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <main className="screen welcome fade-in">
      <div className="welcome-head">
        <Bloom size={56} className="float" />
        <h1 className="brand">{APP.name}</h1>
      </div>

      <section className="card form center">
        {state === "confirm" || state === "busy" ? (
          <>
            <h2 className="card-title">Unsubscribe from emails?</h2>
            <p className="form-intro">
              <strong>{email}</strong> will no longer receive affirmations or updates from {APP.name}.
            </p>
            <button className="btn primary" onClick={confirm} disabled={state === "busy"}>
              {state === "busy" ? "One moment…" : "Yes, unsubscribe me"}
            </button>
            <Link href="/" className="btn ghost">Keep my affirmations</Link>
          </>
        ) : state === "done" ? (
          <>
            <h2 className="card-title">You&rsquo;re unsubscribed</h2>
            <p className="form-intro">
              We won&rsquo;t email <strong>{email}</strong> again. Your daily affirmations in the app are still
              here whenever you need them.
            </p>
            <Link href="/" className="btn ghost">Open {APP.name}</Link>
          </>
        ) : state === "invalid" ? (
          <>
            <h2 className="card-title">This link isn&rsquo;t valid</h2>
            <p className="form-intro">
              Please use the unsubscribe link from one of our emails, or write to{" "}
              <a href={`mailto:${APP.contactEmail}`}>{APP.contactEmail}</a> and we&rsquo;ll remove you.
            </p>
          </>
        ) : (
          <>
            <h2 className="card-title">Something went wrong</h2>
            <p className="form-intro">Please try again in a moment.</p>
            <button className="btn primary" onClick={confirm}>Try again</button>
          </>
        )}
      </section>
    </main>
  );
}
