import { describe, expect, it, vi } from "vite-plus/test";
import { hashGameServerSecret } from "../src/api/game-server-credentials";
import serverV1 from "../src/api/routes/server-v1";

const db = vi.hoisted(() => ({ current: undefined as unknown }));

vi.mock("#db", () => ({ getDb: () => db.current }));

const GAME_SERVER_ID = "c13f3bd2-2c20-47bd-a26e-4f3ae3f7b29c";
const SECRET = "A".repeat(43);
const PLAYER = "1b2c3d4e-5f60-4a7b-8c9d-0e1f2a3b4c5d";
const REQUEST_ID = "5d8f2c1e-9a4b-4c7d-8e2f-1a3b5c7d9e0f";
const CURRENCY = "0f1e2d3c-4b5a-4968-8778-6a5b4c3d2e1f";

const credentialRow = { id: GAME_SERVER_ID, secretHash: hashGameServerSecret(SECRET) };

/**
 * A minimal stand-in for the Drizzle client. Each `select(...)` resolves the next queued result, whether it is awaited
 * directly or ended with `.limit()`. Starting a transaction throws, so a test fails if a refused player reaches a write.
 */
function fakeDb(results: unknown[][]) {
  const queue = [...results];
  return {
    select: () => ({
      from: () => ({
        where: () => {
          const rows = queue.shift() ?? [];
          return Object.assign(Promise.resolve(rows), { limit: async () => rows });
        },
      }),
    }),
    transaction: () => {
      throw new Error("no ledger write expected");
    },
  };
}

function applyCall(body: unknown, headers: Record<string, string> = {}) {
  return serverV1.request(
    "/titles/grand-tale/ledger/server/apply",
    {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
    },
    {} as Env,
  );
}

const validBody = {
  player: PLAYER,
  requestId: REQUEST_ID,
  entries: [{ kind: "currency", id: CURRENCY, delta: 5, reason: "test" }],
};

describe("server routes", () => {
  it("refuse a request with no game-server credential, even when it carries a player bearer", async () => {
    db.current = fakeDb([]);
    const res = await applyCall(validBody, { Authorization: "Bearer player-token" });
    expect(res.status).toBe(401);
  });

  it("refuse a credential whose secret does not match the stored hash", async () => {
    db.current = fakeDb([[{ ...credentialRow, secretHash: hashGameServerSecret("B".repeat(43)) }]]);
    const res = await applyCall(validBody, { "X-Game-Server": `${GAME_SERVER_ID}.${SECRET}` });
    expect(res.status).toBe(401);
  });

  it("accept a valid credential with no player bearer and refuse an unknown player with 409", async () => {
    db.current = fakeDb([[credentialRow], []]);
    const res = await applyCall(validBody, { "X-Game-Server": `${GAME_SERVER_ID}.${SECRET}` });
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ error: "Conflict" });
  });

  it("refuse a body that does not name a player with 400, not 401", async () => {
    db.current = fakeDb([[credentialRow]]);
    const { player: _player, ...withoutPlayer } = validBody;
    const res = await applyCall(withoutPlayer, { "X-Game-Server": `${GAME_SERVER_ID}.${SECRET}` });
    expect(res.status).toBe(400);
  });

  it("refuse an estate state read for an unknown player with 409 and a body without a player with 400", async () => {
    const headers = {
      "content-type": "application/json",
      "X-Game-Server": `${GAME_SERVER_ID}.${SECRET}`,
    };
    db.current = fakeDb([[credentialRow], []]);
    const unknown = await serverV1.request(
      "/titles/grand-tale/estate/server/state",
      { method: "POST", headers, body: JSON.stringify({ player: PLAYER }) },
      {} as Env,
    );
    expect(unknown.status).toBe(409);
    db.current = fakeDb([[credentialRow]]);
    const malformed = await serverV1.request(
      "/titles/grand-tale/estate/server/state",
      { method: "POST", headers, body: JSON.stringify({}) },
      {} as Env,
    );
    expect(malformed.status).toBe(400);
  });
});
