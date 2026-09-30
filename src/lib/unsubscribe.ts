// Server-side only (uses node:crypto and a secret). Do not import from client components.
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Unsubscribe links are signed so nobody can unsubscribe someone else's address.
 *   token = HMAC-SHA256(lowercased email, UNSUBSCRIBE_SECRET) as hex
 * The same formula is used in n8n when building links for emails
 * (Crypto node → HMAC, SHA256, hex, same secret).
 */

export function unsubscribeToken(email: string, secret: string) {
  return createHmac("sha256", secret).update(email.trim().toLowerCase()).digest("hex");
}

export function verifyUnsubscribeToken(email: string, token: string, secret: string) {
  if (!secret || !/^[a-f0-9]{64}$/i.test(token)) return false;
  const expected = Buffer.from(unsubscribeToken(email, secret), "hex");
  const given = Buffer.from(token, "hex");
  return expected.length === given.length && timingSafeEqual(expected, given);
}
