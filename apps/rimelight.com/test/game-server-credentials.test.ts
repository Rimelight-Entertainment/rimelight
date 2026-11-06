import { describe, expect, it } from "vite-plus/test";
import {
  hashGameServerSecret,
  parseGameServerHeader,
  sameSecretHash,
} from "../src/api/game-server-credentials";

const ID = "c13f3bd2-2c20-47bd-a26e-4f3ae3f7b29c";
const SECRET = "A".repeat(43);

describe("game server header", () => {
  it("splits the id and secret on the dot", () => {
    expect(parseGameServerHeader(`${ID}.${SECRET}`)).toEqual({ id: ID, secret: SECRET });
  });

  it("accepts a secret made of the base64url alphabet, including - and _", () => {
    const secret = "aZ09-_".repeat(8).slice(0, 43);
    expect(parseGameServerHeader(`${ID}.${secret}`)).toEqual({ id: ID, secret });
  });

  it("refuses a missing header", () => {
    expect(parseGameServerHeader(undefined)).toBeNull();
    expect(parseGameServerHeader("")).toBeNull();
  });

  it("refuses a header without a dot", () => {
    expect(parseGameServerHeader(`${ID}${SECRET}`)).toBeNull();
  });

  it("refuses an id that is not a UUID", () => {
    expect(parseGameServerHeader(`not-a-uuid.${SECRET}`)).toBeNull();
  });

  it("refuses a secret of the wrong length or alphabet", () => {
    expect(parseGameServerHeader(`${ID}.${"A".repeat(42)}`)).toBeNull();
    expect(parseGameServerHeader(`${ID}.${"A".repeat(44)}`)).toBeNull();
    expect(parseGameServerHeader(`${ID}.${"A".repeat(42)}+`)).toBeNull();
  });

  it("refuses a secret that contains a dot, so only the first dot splits", () => {
    expect(parseGameServerHeader(`${ID}.${"A".repeat(20)}.${"A".repeat(22)}`)).toBeNull();
  });

  it("refuses the retired Server scheme value", () => {
    expect(parseGameServerHeader(`Server ${SECRET}`)).toBeNull();
  });
});

describe("game server secret hash", () => {
  it("hashes a secret to lowercase sha256 hex, deterministically", () => {
    const hash = hashGameServerSecret(SECRET);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hashGameServerSecret(SECRET)).toBe(hash);
    expect(hashGameServerSecret("B".repeat(43))).not.toBe(hash);
  });

  it("compares a hash to the stored hash by exact value", () => {
    const hash = hashGameServerSecret(SECRET);
    expect(sameSecretHash(hash, hash)).toBe(true);
    expect(sameSecretHash(hashGameServerSecret("B".repeat(43)), hash)).toBe(false);
    expect(sameSecretHash(hash.slice(1), hash)).toBe(false);
  });
});
