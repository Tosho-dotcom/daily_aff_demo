# Softbloom — dnevne afirmacije

Jednostavna PWA aplikacija (Next.js 16) koja ženskoj publici daje dnevne afirmacije i istovremeno prikuplja pretplatnice (ime + e-mail) u Notion preko n8n-a.

Radni naziv je **Softbloom**; mijenja se na jednom mjestu: `src/lib/config.ts`.

## Kako radi

| Dio | Rješenje |
|---|---|
| Prva prijava | Ekran s imenom, e-mailom i privolom → `POST /api/subscribe` → n8n webhook → Notion |
| Sljedeća otvaranja | Uređaj pamti prijavu u `localStorage`; nema poziva prema serveru, odmah se otvara glavni ekran |
| Afirmacije | 200 originalnih afirmacija u `src/data/affirmations.ts`, 10 tema po 20 |
| Bez ponavljanja | Izmiješani „špil” na uređaju; nova runda počinje tek kad se prikažu sve |
| Dnevno ograničenje | 5 afirmacija dnevno (lokalni dan korisnice), zatim poruka „come back tomorrow” |
| Ispad n8n-a | Korisnica ipak ulazi; prijava se sprema lokalno i ponovno šalje pri sljedećem otvaranju |
| Zaštita | Honeypot polje protiv botova, tajni ključ između Vercela i n8n-a, validacija na obje strane |

## Lokalno pokretanje

```bash
npm install
npm run dev          # http://localhost:3000
```

Bez varijabli okoline aplikacija radi u demo načinu (prijava se ne prosljeđuje).
Za ponovni prikaz početnog ekrana kliknite „Not Ana?” u podnožju.

## Postavljanje (redom)

### 1. Notion
Baza **Softbloom Subscribers** je već kreirana u vašem Notionu (privatna stranica na razini workspacea).
- Otvorite je → `•••` → **Connections** → dodajte integraciju koju koristi vaš n8n (bez toga API vraća 404).
- Po želji je premjestite pod neku stranicu (npr. uz „Thaus Newsletter”).

Polja: Name, Email, Status (Active/Unsubscribed), Consent, Source, Date subscribed, Date unsubscribed, Timezone, Locale, Country, Created.

### 2. n8n
1. **Workflows → Import from File** → `n8n/softbloom-subscribe.workflow.json`
2. U čvoru **Validate** zamijenite `CHANGE_ME_LONG_RANDOM_STRING` dugim nasumičnim nizom (npr. `openssl rand -hex 32`).
3. U tri HTTP čvora (Find / Reactivate / Create) odaberite postojeći **Notion API** credential.
4. Aktivirajte workflow. Produkcijski URL: `https://tomn8nproject.space/webhook/softbloom-subscribe`

Tijek: `Webhook → Validate → Valid? → Find in Notion → Already subscribed?`
→ ako postoji: `Reactivate subscriber` (Status = Active) → odgovor `exists`
→ ako ne postoji: `Create subscriber` → odgovor `created`
→ neispravan zahtjev: odgovor 401/422.

### 3. Vercel
1. Push na GitHub i import projekta u Vercel (framework se prepoznaje automatski).
2. **Settings → Environment Variables**:
   - `N8N_WEBHOOK_URL` = produkcijski URL iz koraka 2
   - `N8N_WEBHOOK_SECRET` = isti niz kao u čvoru Validate
3. Redeploy, zatim dodajte domenu (**Settings → Domains**).

### 4. Test
Otvorite aplikaciju u privatnom prozoru, prijavite se i provjerite da se red pojavio u Notionu. Druga prijava istim e-mailom ne stvara duplikat.

## Prilagodbe

- **Tekstovi i limit**: `src/lib/config.ts` (naziv, slogan, `dailyLimit`, „Repeat it 5 times before 9 AM”, kontakt e-mail)
- **Afirmacije**: `src/data/affirmations.ts`
- **Boje i fontovi**: varijable na vrhu `src/app/globals.css` (Cormorant Garamond + Nunito, lokalno uključeni, bez Google Fonts poziva)
- **Ikone**: `public/icons/*`, `src/app/icon.png`, `src/app/apple-icon.png`
- **Privatnost**: `src/app/privacy/page.tsx` (ažurirajte kontakt e-mail i naziv nakon odabira domene)

## Struktura

```
src/app/page.tsx              odabir ekrana (prijava / glavni)
src/app/api/subscribe/route.ts proxy prema n8n-u (skriva URL i tajni ključ)
src/app/manifest.ts           PWA manifest
src/app/privacy/page.tsx      stranica o privatnosti
src/components/Welcome.tsx    ekran za ime i e-mail
src/components/Home.tsx       glavni ekran s afirmacijom
src/components/Particles.tsx  čestice (ambijent + prasak pri otkrivanju)
src/lib/storage.ts            lokalna pohrana, špil, dnevni brojač
public/sw.js                  service worker (offline ljuska)
n8n/                          workflow za import
```
