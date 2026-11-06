/**
 * The rules of mail: a letter a server sends one player in one title, with items and currency attached. The player claims it
 * once, and the claim credits every attachment through the wallet's batch rules (title-ledger.ts), in the same transaction that
 * marks the letter claimed. Mail is a delivery channel only: it has no price, shop, or market semantics.
 */
import type { LedgerBatchEntry } from "./title-ledger";

export interface MailItemStack {
  /** The item's internal id (a UUIDv4). */
  item: string;
  quantity: number;
}

export interface MailCurrencyStack {
  /** The currency's internal id (a UUIDv4). */
  currency: string;
  amount: number;
}

/**
 * What a letter says: its recipient, the player who sent its attachments (null for a letter the server grants), and its text.
 * The send id names the letter; it is not part of what the letter says.
 */
export interface MailContent {
  recipient: string;
  sender: string | null;
  title: string;
  subject: string;
  body: string;
  items: MailItemStack[];
  currency: MailCurrencyStack[];
}

/** Whether no id appears twice across a letter's items and currency: the journal keeps one row per id. */
export function mailStacksAreDistinct(
  items: MailItemStack[],
  currency: MailCurrencyStack[],
): boolean {
  const ids = [...items.map((stack) => stack.item), ...currency.map((stack) => stack.currency)];
  return new Set(ids).size === ids.length;
}

/** Whether two strings lists hold the same values, in any order. */
function sameBag(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const left = [...a].sort();
  const right = [...b].sort();
  return left.every((value, index) => value === right[index]);
}

/** Whether two letters say the same thing: the same recipient, title, subject, body, and attachments, in any order. */
export function sameMailContent(a: MailContent, b: MailContent): boolean {
  return (
    a.recipient === b.recipient &&
    a.sender === b.sender &&
    a.title === b.title &&
    a.subject === b.subject &&
    a.body === b.body &&
    sameBag(
      a.items.map((stack) => `${stack.item}=${stack.quantity}`),
      b.items.map((stack) => `${stack.item}=${stack.quantity}`),
    ) &&
    sameBag(
      a.currency.map((stack) => `${stack.currency}=${stack.amount}`),
      b.currency.map((stack) => `${stack.currency}=${stack.amount}`),
    )
  );
}

/**
 * Decides a send whose id is already stored: the same letter again is a replay, which returns the stored row; a different letter
 * under the same id is a conflict, so the sender learns the id was used.
 */
export function decideMailSend(stored: MailContent, incoming: MailContent): "replay" | "conflict" {
  return sameMailContent(stored, incoming) ? "replay" : "conflict";
}

/** A letter as a claim sees it: who it is for and whether it is claimed already. Null when the title has no such letter. */
export interface MailClaimState {
  recipient: string;
  claimed: boolean;
}

export type MailClaimRefusal = "unknown" | "wrong-recipient" | "already-claimed";

/**
 * Decides whether a claimant may claim a letter. An unknown letter, one addressed to someone else, and one already claimed are
 * each refused. The recipient is checked first, so another player learns nothing of the letter's claim state. Null means the
 * claim may go ahead.
 */
export function mailClaimRefusal(
  mail: MailClaimState | null,
  claimant: string,
): MailClaimRefusal | null {
  if (mail === null) return "unknown";
  if (mail.recipient !== claimant) return "wrong-recipient";
  if (mail.claimed) return "already-claimed";
  return null;
}

/** The wallet changes a claim writes: one entry per attachment, each named for the letter it came from. */
export function mailLedgerEntries(mail: {
  id: string;
  subject: string;
  items: MailItemStack[];
  currency: MailCurrencyStack[];
}): LedgerBatchEntry[] {
  const reason = `mail ${mail.id}: ${mail.subject}`;
  return [
    ...mail.items.map((stack): LedgerBatchEntry => ({
      kind: "item",
      id: stack.item,
      delta: stack.quantity,
      reason,
    })),
    ...mail.currency.map((stack): LedgerBatchEntry => ({
      kind: "currency",
      id: stack.currency,
      delta: stack.amount,
      reason,
    })),
  ];
}

/** The wallet changes a send writes for the sender: one debit per attachment, each named `mail.send`. */
export function mailSendLedgerEntries(mail: {
  items: MailItemStack[];
  currency: MailCurrencyStack[];
}): LedgerBatchEntry[] {
  return [
    ...mail.items.map((stack): LedgerBatchEntry => ({
      kind: "item",
      id: stack.item,
      delta: -stack.quantity,
      reason: "mail.send",
    })),
    ...mail.currency.map((stack): LedgerBatchEntry => ({
      kind: "currency",
      id: stack.currency,
      delta: -stack.amount,
      reason: "mail.send",
    })),
  ];
}

/** Why a send is refused for the players it names: the recipient must exist, and the sender too when one is named. */
export type MailSendRefusal = "unknown-recipient" | "unknown-sender";

/** Null when the send may go ahead. `sender` is null for a letter with no sender, which names no one to check. */
export function mailSendRefusal(found: {
  recipient: boolean;
  sender: boolean | null;
}): MailSendRefusal | null {
  if (!found.recipient) return "unknown-recipient";
  if (found.sender === false) return "unknown-sender";
  return null;
}
