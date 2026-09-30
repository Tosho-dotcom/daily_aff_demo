"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

type Leaving = "" | "fade" | "left" | "right";

export default function Home({ profile, onReset }: { profile: Profile; onReset: () => void }) {
  /** Today's affirmations, in the order they were revealed. */
  const [shown, setShown] = useState<Affirmation[]>([]);
  /** Which of today's affirmations is on screen. */
  const [index, setIndex] = useState(0);
  const [burst, setBurst] = useState(0);
  const [leaving, setLeaving] = useState<Leaving>("");
  const [enterFrom, setEnterFrom] = useState<"" | "left" | "right">("");
  const [hello, setHello] = useState("Hello");
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    // Restore today's affirmations so reopening the app keeps the moment.
    const s = getDayStatus();
    /* eslint-disable react-hooks/set-state-in-effect -- reading device storage after mount */
    setHello(greeting());
    setShown(s.shown);
    setIndex(Math.max(0, s.shown.length - 1));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const current = shown[index] ?? null;
  const used = shown.length;
  const remaining = APP.dailyLimit - used;
  const busy = leaving !== "";

  function reveal() {
    const res = drawAffirmation();
    if (!res) return;
    const hadOne = shown.length > 0;
    if (!hadOne) setBurst((b) => b + 1);
    setLeaving("fade");
    setTimeout(() => {
      setShown((s) => [...s, res.item]);
      setIndex(shown.length);
      setEnterFrom("");
      if (hadOne) setBurst((b) => b + 1);
      setLeaving("");
    }, hadOne ? 450 : 380);
  }

  /** Browse to an already revealed affirmation (no particles, gentle slide). */
  const goTo = useCallback(
    (i: number) => {
      if (busy || i === index || i < 0 || i >= shown.length) return;
      const forward = i > index;
      setLeaving(forward ? "left" : "right");
      setTimeout(() => {
        setIndex(i);
        setEnterFrom(forward ? "right" : "left");
        setLeaving("");
      }, 280);
    },
    [busy, index, shown.length],
  );

  // Keyboard arrows on desktop.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, index]);

  // Swipe on touch screens.
  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) < 50) return;
    goTo(dx < 0 ? index + 1 : index - 1);
  }

  const words = current?.text.split(" ") ?? [];
  const leaveClass =
    leaving === "fade" ? "aff-out" : leaving === "left" ? "aff-out-left" : leaving === "right" ? "aff-out-right" : "";
  const enterClass = enterFrom === "right" ? "aff-in-right" : enterFrom === "left" ? "aff-in-left" : "";

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

        <section className="stage" aria-live="polite" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {!current ? (
            <button className={`orb ${busy ? "orb-out" : ""}`} onClick={reveal} disabled={busy}>
              <span className="orb-glow" aria-hidden="true" />
              <span className="orb-label">
                Give me my
                <br />
                daily affirmation
              </span>
            </button>
          ) : (
            <figure key={`${current.id}-${enterFrom}`} className={`affirmation ${enterClass} ${leaveClass}`}>
              <span className="theme-tag">{current.theme.replace("-", " ")}</span>
              <blockquote>
                {words.map((w, i) => (
                  <span key={i} className="word" style={{ animationDelay: `${(enterFrom ? 60 : 180) + i * (enterFrom ? 35 : 70)}ms` }}>
                    {w}{" "}
                  </span>
                ))}
              </blockquote>
            </figure>
          )}
        </section>

        <footer className="home-foot">
          {current &&
            (remaining > 0 ? (
              <button className="btn ghost" onClick={reveal} disabled={busy}>
                Give me another
              </button>
            ) : (
              <p className="limit">That&rsquo;s your five for today. Come back tomorrow for fresh words.</p>
            ))}

          <div className="pager" role="group" aria-label="Today's affirmations">
            {current && (
              <button
                className="pager-arrow"
                onClick={() => goTo(index - 1)}
                disabled={busy || index === 0}
                aria-label="Previous affirmation"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
              </button>
            )}
            <div className="dots">
              {Array.from({ length: APP.dailyLimit }, (_, i) => {
                const seen = i < used;
                const active = current && i === index;
                return (
                  <button
                    key={i}
                    className={`dot ${seen ? "on" : ""} ${active ? "active" : ""}`}
                    onClick={() => goTo(i)}
                    disabled={!seen || busy}
                    aria-label={seen ? `Affirmation ${i + 1} of ${used}` : `Affirmation ${i + 1} not revealed yet`}
                    aria-current={active ? "true" : undefined}
                  />
                );
              })}
            </div>
            {current && (
              <button
                className="pager-arrow"
                onClick={() => goTo(index + 1)}
                disabled={busy || index >= used - 1}
                aria-label="Next affirmation"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
              </button>
            )}
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
