"use client";

import { affirmations, type Affirmation } from "@/data/affirmations";
import { APP } from "@/lib/config";

/**
 * Everything is kept on the device (localStorage). No server round-trip is
 * needed to know whether this device has already signed up.
 */

const KEY = "softbloom:v1";

export type Profile = { name: string; email: string; joinedAt: string };

type State = {
  profile: Profile | null;
  /** Subscription that could not reach the server yet; retried on next open. */
  pending: SubscribePayload | null;
  /** Remaining affirmation ids in shuffled order (no repeats until all are seen). */
  deck: number[];
  /** Local calendar day the counter belongs to (YYYY-MM-DD). */
  day: string;
  /** Ids shown today, in order. */
  today: number[];
};

export type SubscribePayload = {
  name: string;
  email: string;
  consent: boolean;
  timezone: string;
  locale: string;
  source: string;
};

const empty = (): State => ({ profile: null, pending: null, deck: [], day: todayKey(), today: [] });

export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function read(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    return { ...empty(), ...(JSON.parse(raw) as Partial<State>) };
  } catch {
    return empty();
  }
}

function write(s: State) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable (private mode) – app still works for this visit */
  }
}

/** Reset the daily counter when a new day starts. */
function rolled(s: State): State {
  const t = todayKey();
  return s.day === t ? s : { ...s, day: t, today: [] };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const byId = new Map(affirmations.map((a) => [a.id, a]));

// ---------- public API ----------

export function getProfile(): Profile | null {
  return read().profile;
}

export function saveProfile(p: Profile, pending: SubscribePayload | null) {
  write({ ...read(), profile: p, pending });
}

export function getPending(): SubscribePayload | null {
  return read().pending;
}

export function clearPending() {
  write({ ...read(), pending: null });
}

export type DayStatus = { shown: Affirmation[]; remaining: number };

export function getDayStatus(): DayStatus {
  const s = rolled(read());
  write(s);
  const shown = s.today.map((id) => byId.get(id)).filter(Boolean) as Affirmation[];
  return { shown, remaining: Math.max(0, APP.dailyLimit - shown.length) };
}

/** Draws the next unseen affirmation, or null once today's limit is reached. */
export function drawAffirmation(): { item: Affirmation; remaining: number } | null {
  let s = rolled(read());
  if (s.today.length >= APP.dailyLimit) return null;

  let deck = s.deck.filter((id) => byId.has(id));
  if (deck.length === 0) {
    // Full cycle completed: reshuffle, but never start with the last one shown.
    const last = s.today.at(-1);
    deck = shuffle(affirmations.map((a) => a.id));
    if (deck[0] === last && deck.length > 1) deck.push(deck.shift()!);
  }

  const id = deck.shift()!;
  s = { ...s, deck, today: [...s.today, id] };
  write(s);
  return { item: byId.get(id)!, remaining: APP.dailyLimit - s.today.length };
}

/** Clears everything on this device (used by the "not you?" link). */
export function resetDevice() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
