// Generates a signed unsubscribe link for testing.
// Usage:  npm run unsub-link -- ana@example.com [https://your-domain.com]
// Reads UNSUBSCRIBE_SECRET from .env.local (or the environment).
import { createHmac } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const email = (process.argv[2] ?? "").trim().toLowerCase();
const base = (process.argv[3] ?? "http://localhost:3000").replace(/\/$/, "");
const secret = process.env.UNSUBSCRIBE_SECRET;

if (!email) {
  console.error("Usage: npm run unsub-link -- email@example.com [https://your-domain.com]");
  process.exit(1);
}
if (!secret) {
  console.error("UNSUBSCRIBE_SECRET is not set (add it to .env.local).");
  process.exit(1);
}

const token = createHmac("sha256", secret).update(email).digest("hex");
console.log(`${base}/unsubscribe?e=${encodeURIComponent(email)}&t=${token}`);
