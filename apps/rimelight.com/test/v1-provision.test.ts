import { describe, expect, it, vi } from "vite-plus/test";

vi.mock("#db", () => ({ getDb: () => ({}) }));

const { ProvisionConflictError, provisionUser } = await import("../src/api/routes/v1/provision");

/**
 * A minimal stand-in for the Drizzle client. Each `select(...).limit()` resolves the next queued
 * result, and every insert is recorded.
 */
function fakeDb(selectResults: unknown[][]) {
  const queue = [...selectResults];
  const inserted: Record<string, unknown>[] = [];
  const db = {
    inserted,
    select: () => ({
      from: () => ({
        where: () => ({ limit: async () => queue.shift() ?? [] }),
      }),
    }),
    insert: () => ({
      values: (row: Record<string, unknown>) => {
        inserted.push(row);
        return { onConflictDoNothing: async () => undefined };
      },
    }),
  };
  return db;
}

const claims = { sub: "auth0|abc", email: "player@example.com" };
const created = { id: "user-1", auth0Id: claims.sub, email: claims.email };

describe("provisionUser", () => {
  it("returns the existing row for a known subject without inserting", async () => {
    const db = fakeDb([[created]]);
    const user = await provisionUser(db as any, claims);
    expect(user).toEqual(created);
    expect(db.inserted).toHaveLength(0);
  });

  it("creates a row when neither the subject nor the email exists", async () => {
    const db = fakeDb([[], [], [created]]);
    const user = await provisionUser(db as any, claims);
    expect(user).toEqual(created);
    expect(db.inserted).toHaveLength(1);
    expect(db.inserted[0]).toMatchObject({
      auth0Id: claims.sub,
      email: claims.email,
      name: "player",
      tag: "0000",
    });
  });

  it("reports a conflict when the email belongs to another account, without modifying it", async () => {
    const db = fakeDb([[], [{ id: "other", auth0Id: null, email: claims.email }]]);
    await expect(provisionUser(db as any, claims)).rejects.toBeInstanceOf(ProvisionConflictError);
    expect(db.inserted).toHaveLength(0);
  });
});
