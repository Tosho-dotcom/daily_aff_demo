"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Bloom from "./Bloom";
import Particles from "./Particles";
import { APP } from "@/lib/config";
import { drawAffirmation, getDayStatus, type Profile } from "@/lib/storage";
import type { Affirmation } from "@/data/affirmations";

function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 5) return "Hello";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Home({ profile, onReset }: { profile: Profile; onReset: () => void }) {
  const [current, setCurrent] = useState<Affirmation | null>(null);
  const [used, setUsed] = useState(0);
  const [burst, setBurst] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [hello, setHello] = useState("Hello");

  useEffect(() => {
    // Restore today's last affirmation so reopening the app keeps the moment.
    const s = getDayStatus();
    /* eslint-disable react-hooks/set-state-in-effect -- reading device storage after mount */
    setHello(greeting());
    setUsed(s.shown.length);
    if (s.shown.length) setCurrent(s.shown[s.shown.length - 1]);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const remaining = APP.dailyLimit - used;

  function reveal() {
    const res = drawAffirmation();
    if (!res) return;
    const go = () => {
      setCurrent(res.item);
      setUsed(APP.dailyLimit - res.remaining);
      setBurst((b) => b + 1);
      setLeaving(false);
    };
    if (current) {
      setLeaving(true);
      setTimeout(go, 450);
    } else {
      setBurst((b) => b + 1);
      setLeaving(true);
      setTimeout(go, 380);
    }
  }

  const words = current?.text.split(" ") ?? [];

  return (
    <>
      <Particles burstKey={burst} />
      <main className="screen home fade-in">
        <header className="home-head">
          <div className="mini-brand">
            <Bloom size={26} />
            <span>{APP.name}</span>
          </div>
          <p className="hello">
            {hello}, <em>{profile.name}</em>
          </p>
        </header>

        <section className="stage" aria-live="polite">
          {!current ? (
            <button className={`orb ${leaving ? "orb-out" : ""}`} onClick={reveal} disabled={leaving}>
              <span className="orb-glow" aria-hidden="true" />
              <span className="orb-label">
                Give me my
                <br />
                daily affirmation
              </span>
            </button>
          ) : (
            <figure key={current.id} className={`affirmation ${leaving ? "aff-out" : ""}`}>
              <span className="theme-tag">{current.theme.replace("-", " ")}</span>
              <blockquote>
                {words.map((w, i) => (
                  <span key={i} className="word" style={{ animationDelay: `${180 + i * 70}ms` }}>
                    {w}{" "}
                  </span>
                ))}
              </blockquote>
              <figcaption className="repeat" style={{ animationDelay: `${400 + words.length * 70}ms` }}>
                <span className="repeat-line" aria-hidden="true" />
                {APP.repeatHint}
                <span className="repeat-line" aria-hidden="true" />
              </figcaption>
            </figure>
          )}
        </section>

        <footer className="home-foot">
          {current && (
            remaining > 0 ? (
              <button className="btn ghost" onClick={reveal} disabled={leaving}>
                Give me another
              </button>
            ) : (
              <p className="limit">That&rsquo;s your five for today. Come back tomorrow for fresh words.</p>
            )
          )}
          <div className="dots" aria-label={`${used} of ${APP.dailyLimit} affirmations used today`}>
            {Array.from({ length: APP.dailyLimit }, (_, i) => (
              <span key={i} className={i < used ? "dot on" : "dot"} />
            ))}
          </div>
          <nav className="legal">
            <Link href="/privacy">Privacy</Link>
            <span aria-hidden="true">·</span>
            <button className="linklike" onClick={onReset}>Not {profile.name}?</button>
            <span aria-hidden="true">·</span>
            <a href={APP.creditUrl} target="_blank" rel="noopener">{APP.creditLabel}</a>
          </nav>
        </footer>
      </main>
    </>
  );
}
