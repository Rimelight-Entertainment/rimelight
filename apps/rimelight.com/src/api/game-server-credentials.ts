import { Buffer } from "node:buffer";
import { createHash, timingSafeEqual } from "node:crypto";

/**
 * The game server's credential, as the server sends it in `X-Game-Server: <id>.<secret>`. The id is the credential's UUID. The
 * secret is 32 random bytes in base64url with no padding, so it is 43 characters from that alphabet and never contains a dot.
 */
const GAME_SERVER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const GAME_SERVER_SECRET = /^[A-Za-z0-9_-]{43}$/;

export interface GameServerCredential {
  id: string;
  secret: string;
}

/** Splits an `X-Game-Server` value on its first dot. Returns null when it is missing or malformed. */
export function parseGameServerHeader(value: string | undefined): GameServerCredential | null {
  if (!value) return null;
  const dot = value.indexOf(".");
  if (dot < 0) return null;
  const id = value.slice(0, dot);
  const secret = value.slice(dot + 1);
  if (!GAME_SERVER_ID.test(id) || !GAME_SERVER_SECRET.test(secret)) return null;
  return { id, secret };
}

/** The SHA-256 of a secret, in lowercase hex. Only this hash is stored. */
export function hashGameServerSecret(secret: string): string {
  return createHash("sha256").update(secret, "utf8").digest("hex");
}

/**
 * Compares two strings in time that does not depend on where they first differ. Strings of different length are unequal;
 * the length is not secret, because a stored hash always has the same length.
 */
export function sameSecretHash(given: string, expected: string): boolean {
  const a = Buffer.from(given, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
