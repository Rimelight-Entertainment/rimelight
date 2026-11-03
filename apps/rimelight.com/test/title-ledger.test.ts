import { describe, expect, it } from "vite-plus/test";
import { planLedger } from "../src/api/title-ledger";

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
