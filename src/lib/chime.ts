"use client";

/**
 * Soft, quiet bell chime synthesised with the Web Audio API (no audio files).
 * Two or three bright tones, slightly staggered, decaying slowly, with a hint of echo.
 * The AudioContext is created on the first user tap (browsers block audio before that).
 */

const SOUND_KEY = "softbloom:sound";
const VOLUME = 0.07; // master level – deliberately very quiet

// A few pleasant voicings (Hz) so the chime varies a little each time.
const VOICINGS = [
  [1046.5, 1318.5, 1568.0], // C6 E6 G6
  [1174.7, 1480.0, 1760.0], // D6 F#6 A6
  [987.8, 1318.5, 1661.2], // B5 E6 G#6
  [1046.5, 1568.0, 2093.0], // C6 G6 C7
];

let ctx: AudioContext | null = null;
let out: GainNode | null = null;

export function isSoundOn(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {}
}

/** Must be called synchronously inside a click/tap handler the first time. */
function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    // master → soft low-pass → speakers, plus a quiet feedback echo for "space"
    out = ctx.createGain();
    out.gain.value = VOLUME;
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 5200;
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.19;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.28;
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    out.connect(tone);
    tone.connect(ctx.destination);
    tone.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function bell(ac: AudioContext, freq: number, start: number, level: number) {
  const env = ac.createGain();
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(level, start + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, start + 2.4);
  env.connect(out!);

  // fundamental + a faint inharmonic partial gives the "glass bell" colour
  const partials: [number, number][] = [
    [1, 1],
    [2.76, 0.18],
    [5.4, 0.05],
  ];
  for (const [ratio, gain] of partials) {
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq * ratio;
    const g = ac.createGain();
    g.gain.value = gain;
    osc.connect(g);
    g.connect(env);
    osc.start(start);
    osc.stop(start + 2.5);
  }
}

/**
 * Play the chime. Call it directly from the click handler;
 * `delay` (seconds) lets it land together with the visual reveal.
 */
export function playChime(delay = 0) {
  if (!isSoundOn()) return;
  const ac = ensureContext();
  if (!ac || !out) return;
  const notes = VOICINGS[Math.floor(Math.random() * VOICINGS.length)];
  const t0 = ac.currentTime + delay + 0.02;
  notes.forEach((f, i) => bell(ac, f, t0 + i * 0.085, i === 0 ? 0.9 : 0.65));
}
