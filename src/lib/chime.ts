"use client";

/**
 * "Singing bowl" sound, synthesised with the Web Audio API (no audio files).
 * A warm low tone with slow beating between two slightly detuned voices,
 * a soft attack and a long, gentle fade, plus a light room reverb.
 * The AudioContext is created on the first user tap (browsers block audio before that).
 */

const SOUND_KEY = "softbloom:sound";
const VOLUME = 0.09; // master level – deliberately quiet (about -18 dBFS peak)
const BOWL_HZ = 262; // fundamental (≈ C4)

let ctx: AudioContext | null = null;
let bus: GainNode | null = null;

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

/** Short synthetic room reverb (decaying noise impulse). */
function makeReverb(ac: AudioContext, seconds = 2.8, decay = 3) {
  const len = Math.floor(ac.sampleRate * seconds);
  const ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  const conv = ac.createConvolver();
  conv.buffer = ir;
  return conv;
}

/** Must be called synchronously inside a click/tap handler the first time. */
function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = VOLUME;
    master.connect(ctx.destination);
    bus = ctx.createGain();
    const reverb = makeReverb(ctx);
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    bus.connect(master);
    bus.connect(reverb);
    reverb.connect(wet);
    wet.connect(master);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function voice(
  ac: AudioContext,
  freq: number,
  start: number,
  dur: number,
  level: number,
  attack: number,
  partials: [number, number][],
) {
  const env = ac.createGain();
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(level, start + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  env.connect(bus!);
  for (const [ratio, gain] of partials) {
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq * ratio;
    const g = ac.createGain();
    g.gain.value = gain;
    osc.connect(g);
    g.connect(env);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }
}

/**
 * Play the bowl. Call it directly from the click handler;
 * `delay` (seconds) lets it land together with the visual reveal.
 */
export function playChime(delay = 0) {
  if (!isSoundOn()) return;
  const ac = ensureContext();
  if (!ac || !bus) return;
  const t = ac.currentTime + delay + 0.02;
  // main voice with the bowl's inharmonic overtones
  voice(ac, BOWL_HZ, t, 4.2, 0.8, 0.06, [
    [1, 1],
    [2.71, 0.35],
    [5.1, 0.12],
  ]);
  // slightly detuned twin → the slow "wah-wah" shimmer of a real bowl
  voice(ac, BOWL_HZ * 1.004, t, 4.0, 0.5, 0.08, [
    [1, 1],
    [2.72, 0.3],
  ]);
}
