import { describe, expect, it } from "vite-plus/test";
import {
  decideLedgerRequest,
  isSameStoredRequest,
  netBatch,
  planLedger,
} from "../src/api/title-ledger";

const GOLD = "c13f3bd2-2c20-47bd-a26e-4f3ae3f7b29c";
const ROCK = "11111111-1111-4111-8111-111111111111";

describe("ledger plan", () => {
  it("applies a batch that fits and returns every amount it moves", () => {
    const plan = planLedger(new Map([[GOLD, 100]]), [{ id: GOLD, delta: -40 }], { [GOLD]: 999 });
    expect(plan.ok).toBe(true);
    if (plan.ok) expect(plan.next.get(GOLD)).toBe(60);
  });

  it("refuses a batch whose entries add up to an overdraw, even if each entry alone fits", () => {
    const plan = planLedger(
      new Map([[GOLD, 100]]),
      [
        { id: GOLD, delta: -60 },
        { id: GOLD, delta: -60 },
      ],
      { [GOLD]: 999 },
    );
    expect(plan).toEqual({ ok: false, id: GOLD, reason: "short" });
  });

  it("refuses a credit past the cap", () => {
    const plan = planLedger(new Map([[ROCK, 4]]), [{ id: ROCK, delta: 2 }], { [ROCK]: 5 });
    expect(plan).toEqual({ ok: false, id: ROCK, reason: "over-cap" });
  });

  it("refuses the whole batch when one part does not fit", () => {
    const plan = planLedger(
      new Map([
        [GOLD, 100],
        [ROCK, 5],
      ]),
      [
        { id: GOLD, delta: -30 },
        { id: ROCK, delta: 1 },
      ],
      { [GOLD]: 999, [ROCK]: 5 },
    );
    expect(plan.ok).toBe(false);
  });

  it("treats an id with no cap as uncapped, and an unseen id as zero", () => {
    const plan = planLedger(new Map(), [{ id: ROCK, delta: 1000000 }], {});
    expect(plan.ok).toBe(true);
    if (plan.ok) expect(plan.next.get(ROCK)).toBe(1000000);
  });
});

describe("ledger batch netting and replay", () => {
  it("nets a batch per id, adding up repeated entries", () => {
    const net = netBatch([
      { kind: "currency", id: GOLD, delta: -40, reason: "estate payment" },
      { kind: "currency", id: GOLD, delta: -10, reason: "estate payment" },
      { kind: "item", id: ROCK, delta: 3, reason: "loot roll table=t roll=1" },
    ]);
    expect(net).toEqual(
      new Map([
        [GOLD, { kind: "currency", delta: -50, reason: "estate payment" }],
        [ROCK, { kind: "item", delta: 3, reason: "loot roll table=t roll=1" }],
      ]),
    );
  });

  it("keeps every distinct reason of the changes it adds up, so a merged row names each drop", () => {
    const net = netBatch([
      { kind: "item", id: ROCK, delta: 2, reason: "loot roll table=t roll=1" },
      { kind: "item", id: ROCK, delta: 1, reason: "loot roll table=t roll=2" },
      { kind: "item", id: ROCK, delta: 1, reason: "loot roll table=t roll=1" },
    ]);
    expect(net?.get(ROCK)).toEqual({
      kind: "item",
      delta: 4,
      reason: "loot roll table=t roll=1; loot roll table=t roll=2",
    });
  });

  it("refuses a batch that names one id as both a currency and an item", () => {
    expect(
      netBatch([
        { kind: "currency", id: GOLD, delta: 1, reason: "test" },
        { kind: "item", id: GOLD, delta: 1, reason: "test" },
      ]),
    ).toBeNull();
  });

  it("applies a batch whose request id has not been seen", () => {
    expect(
      decideLedgerRequest(null, [{ kind: "currency", id: GOLD, delta: -5, reason: "test" }]),
    ).toBe("apply");
  });

  it("replays a retry with the same changes", () => {
    const batch = [
      { kind: "currency" as const, id: GOLD, delta: -5, reason: "test" },
      { kind: "item" as const, id: ROCK, delta: 2, reason: "test" },
    ];
    expect(decideLedgerRequest(batch, [...batch].reverse())).toBe("replay");
  });

  it("conflicts when the same request id names a different amount", () => {
    expect(
      decideLedgerRequest(
        [{ kind: "currency", id: GOLD, delta: -5, reason: "test" }],
        [{ kind: "currency", id: GOLD, delta: -6, reason: "test" }],
      ),
    ).toBe("conflict");
  });

  it("conflicts when the same request id names a different id", () => {
    expect(
      decideLedgerRequest(
        [{ kind: "currency", id: GOLD, delta: -5, reason: "test" }],
        [{ kind: "currency", id: ROCK, delta: -5, reason: "test" }],
      ),
    ).toBe("conflict");
  });

  it("conflicts when the same request id names a different kind", () => {
    expect(
      decideLedgerRequest(
        [{ kind: "currency", id: GOLD, delta: -5, reason: "test" }],
        [{ kind: "item", id: GOLD, delta: -5, reason: "test" }],
      ),
    ).toBe("conflict");
  });

  it("conflicts when the same request id adds an entry the stored batch lacks", () => {
    expect(
      decideLedgerRequest(
        [{ kind: "currency", id: GOLD, delta: -5, reason: "test" }],
        [
          { kind: "currency", id: GOLD, delta: -5, reason: "test" },
          { kind: "item", id: ROCK, delta: 1, reason: "test" },
        ],
      ),
    ).toBe("conflict");
  });
});

describe("replay payload compare", () => {
  it("treats an identical stored payload as the same request", () => {
    expect(isSameStoredRequest({ id: GOLD, delta: 5 }, { id: GOLD, delta: 5 })).toBe(true);
  });

  it("treats a different value under the same RequestId as a different request", () => {
    expect(isSameStoredRequest({ id: GOLD, delta: 5 }, { id: GOLD, delta: 6 })).toBe(false);
  });

  it("treats a different key set as a different request", () => {
    expect(isSameStoredRequest({ id: GOLD, delta: 5 }, { id: GOLD })).toBe(false);
  });

  it("never matches a legacy batch with no stored request", () => {
    expect(isSameStoredRequest(null, { id: GOLD, delta: 5 })).toBe(false);
  });
});
