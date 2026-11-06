import { describe, expect, it } from "vite-plus/test";
import { netBatch, planLedger } from "../src/api/title-ledger";
import {
  decideMailSend,
  mailSendLedgerEntries,
  mailSendRefusal,
  mailClaimRefusal,
  mailLedgerEntries,
  mailStacksAreDistinct,
  type MailContent,
} from "../src/api/title-mail";

const GOLD = "c13f3bd2-2c20-47bd-a26e-4f3ae3f7b29c";
const ROCK = "11111111-1111-4111-8111-111111111111";
const ORE = "22222222-2222-4222-8222-222222222222";
const ALICE = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const BOB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const LETTER = "33333333-3333-4333-8333-333333333333";

const letter: MailContent = {
  recipient: ALICE,
  sender: null,
  title: "grand-tale",
  subject: "Welcome",
  body: "Enjoy the island.",
  items: [
    { item: ROCK, quantity: 3 },
    { item: ORE, quantity: 1 },
  ],
  currency: [{ currency: GOLD, amount: 250 }],
};

describe("mail send", () => {
  it("replays the same letter sent again, whatever order its attachments come in", () => {
    const reordered = { ...letter, items: [...letter.items].reverse() };
    expect(decideMailSend(letter, reordered)).toBe("replay");
  });

  it("refuses a different letter sent under an id already used", () => {
    expect(decideMailSend(letter, { ...letter, body: "Changed." })).toBe("conflict");
    expect(
      decideMailSend(letter, { ...letter, items: [{ item: ROCK, quantity: 4 }, letter.items[1]!] }),
    ).toBe("conflict");
  });

  it("refuses a letter whose items and currency share an id", () => {
    expect(
      mailStacksAreDistinct([{ item: ROCK, quantity: 1 }], [{ currency: ROCK, amount: 1 }]),
    ).toBe(false);
    expect(mailStacksAreDistinct(letter.items, letter.currency)).toBe(true);
  });
});

describe("mail claim", () => {
  it("lets the recipient claim a letter that is not claimed", () => {
    expect(mailClaimRefusal({ recipient: ALICE, claimed: false }, ALICE)).toBeNull();
  });

  it("refuses an unknown letter", () => {
    expect(mailClaimRefusal(null, ALICE)).toBe("unknown");
  });

  it("refuses a claim by someone other than the recipient", () => {
    expect(mailClaimRefusal({ recipient: ALICE, claimed: false }, BOB)).toBe("wrong-recipient");
  });

  it("refuses a second claim of a letter already claimed", () => {
    expect(mailClaimRefusal({ recipient: ALICE, claimed: true }, ALICE)).toBe("already-claimed");
  });

  it("reports the wrong recipient before the claim state, so a stranger learns nothing", () => {
    expect(mailClaimRefusal({ recipient: ALICE, claimed: true }, BOB)).toBe("wrong-recipient");
  });
});

describe("mail ledger batch", () => {
  const entries = mailLedgerEntries({
    id: LETTER,
    subject: letter.subject,
    items: letter.items,
    currency: letter.currency,
  });

  it("writes one entry per attachment, each named for the letter it came from", () => {
    const reason = `mail ${LETTER}: Welcome`;
    expect(entries).toEqual([
      { kind: "item", id: ROCK, delta: 3, reason },
      { kind: "item", id: ORE, delta: 1, reason },
      { kind: "currency", id: GOLD, delta: 250, reason },
    ]);
    expect(netBatch(entries)?.size).toBe(3);
  });

  it("credits each item and currency exactly once when the batch fits", () => {
    const plan = planLedger(
      new Map([
        [GOLD, 10],
        [ROCK, 0],
        [ORE, 0],
      ]),
      entries,
      { [GOLD]: 1000, [ROCK]: 99, [ORE]: 99 },
    );
    expect(plan.ok).toBe(true);
    if (plan.ok) {
      expect(plan.next.get(GOLD)).toBe(260);
      expect(plan.next.get(ROCK)).toBe(3);
      expect(plan.next.get(ORE)).toBe(1);
    }
  });

  it("refuses the whole claim when an attachment would go over its cap", () => {
    const plan = planLedger(
      new Map([
        [GOLD, 10],
        [ROCK, 0],
        [ORE, 0],
      ]),
      entries,
      { [GOLD]: 1000, [ROCK]: 2, [ORE]: 99 },
    );
    expect(plan).toEqual({ ok: false, id: ROCK, reason: "over-cap" });
  });
});

describe("mail send sender", () => {
  it("names the sender in the letter, so the same id from another sender conflicts", () => {
    expect(decideMailSend(letter, { ...letter, sender: BOB })).toBe("conflict");
    expect(decideMailSend({ ...letter, sender: BOB }, { ...letter, sender: BOB })).toBe("replay");
  });

  it("debits the sender once per attachment, each named mail.send", () => {
    expect(mailSendLedgerEntries({ items: letter.items, currency: letter.currency })).toEqual([
      { kind: "item", id: ROCK, delta: -3, reason: "mail.send" },
      { kind: "item", id: ORE, delta: -1, reason: "mail.send" },
      { kind: "currency", id: GOLD, delta: -250, reason: "mail.send" },
    ]);
  });

  it("debits nothing for a letter without attachments", () => {
    expect(mailSendLedgerEntries({ items: [], currency: [] })).toEqual([]);
  });

  it("refuses the whole debit when the sender is short of one attachment", () => {
    const plan = planLedger(
      new Map([
        [GOLD, 100],
        [ROCK, 3],
        [ORE, 1],
      ]),
      mailSendLedgerEntries({ items: letter.items, currency: letter.currency }),
      { [GOLD]: 1000, [ROCK]: 99, [ORE]: 99 },
    );
    expect(plan).toEqual({ ok: false, id: GOLD, reason: "short" });
  });

  it("refuses a send whose recipient is unknown, or whose named sender is unknown", () => {
    expect(mailSendRefusal({ recipient: false, sender: true })).toBe("unknown-recipient");
    expect(mailSendRefusal({ recipient: true, sender: false })).toBe("unknown-sender");
    expect(mailSendRefusal({ recipient: true, sender: null })).toBeNull();
    expect(mailSendRefusal({ recipient: true, sender: true })).toBeNull();
  });
});
