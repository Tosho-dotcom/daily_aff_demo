import type { Metadata } from "next";
import Link from "next/link";
import { APP } from "@/lib/config";

export const metadata: Metadata = { title: `Privacy — ${APP.name}` };

export default function Privacy() {
  return (
    <main className="screen prose fade-in">
      <Link href="/" className="back">← Back</Link>
      <h1>Privacy</h1>
      <p className="muted">Last updated: September 2026</p>

      <h2>What we collect</h2>
      <p>
        When you start using {APP.name} we ask for your first name and email address. We also record the time
        you signed up, your time zone, browser language and approximate country, so we can send emails at a
        sensible hour.
      </p>

      <h2>Why</h2>
      <p>
        We use your details only to send you affirmations and occasional updates about {APP.name}. The legal
        basis is your consent, which you give by ticking the box on the welcome screen. We never sell or share
        your information with advertisers.
      </p>

      <h2>Where it is stored</h2>
      <p>
        Your name and email are stored in our subscriber list (Notion) and processed through our own
        automation server. Which affirmations you have seen and your daily count are stored only on your
        device and never leave it.
      </p>

      <h2>Your choices</h2>
      <p>
        You can unsubscribe from any email with one click, or ask us to access, correct or delete your data at
        any time by writing to <a href={`mailto:${APP.contactEmail}`}>{APP.contactEmail}</a>. We keep your
        details only while you are subscribed.
      </p>

      <h2>Not medical advice</h2>
      <p>
        {APP.name} offers positive words for everyday wellbeing. It is not a substitute for professional
        medical or psychological care.
      </p>
    </main>
  );
}
