// The normal form (MAPPING section 4). `exportPage(importPage(x))` equals `normalizePage(x)` for every fixture.
// Mirrors `crates/rimelight_content/src/normalize.rs`.

import { textKind } from "./registry";
import { CANON_MARKS, deepEqual, isRich } from "./values";

type Json = Record<string, any>;

/** Normal form of a whole page. Meta is kept as is; block trees and rich props are normalized. */
export function normalizePage<T>(page: T): T {
  const source = page as unknown as Json;
  const blocks = source?.["content"]?.blocks;
  if (!Array.isArray(blocks)) return page;
  return {
    ...source,
    content: { ...source["content"], blocks: blocks.map(normalizeBlock) },
  } as unknown as T;
}

/** Normal form of one block: rich props (by the registry's text rules) and its children. */
function normalizeBlock(block: unknown): unknown {
  if (typeof block !== "object" || block === null || Array.isArray(block)) return block;
  const obj = block as Json;
  const out: Json = { ...obj };
  const blockType = typeof obj["type"] === "string" ? obj["type"] : "";
  if (typeof obj["props"] === "object" && obj["props"] !== null && !Array.isArray(obj["props"])) {
    const props: Json = { ...obj["props"] };
    for (const [key, value] of Object.entries(obj["props"] as Json)) {
      if (textKind(blockType, key) === "rich" && isRich(value)) {
        props[key] = normalizeRich(value);
      }
    }
    out["props"] = props;
  }
  if (Array.isArray(obj["children"]) && obj["children"].length > 0) {
    out["children"] = obj["children"].map(normalizeBlock);
  } else {
    delete out["children"];
  }
  return out;
}

/** Normal form of a rich text value: a node array, or a per-locale map of node arrays. */
export function normalizeRich<T>(value: T): T {
  if (Array.isArray(value)) return normalizeNodes(value) as unknown as T;
  if (typeof value === "object" && value !== null) {
    const out: Json = {};
    for (const [locale, v] of Object.entries(value as Json)) {
      out[locale] = Array.isArray(v) ? normalizeNodes(v) : v;
    }
    return out as T;
  }
  return value;
}

/** Normalizes a node list: each node, then merges of adjacent nodes that Loro would merge. */
export function normalizeNodes(nodes: readonly unknown[]): Json[] {
  const out: Json[] = [];
  for (const node of nodes) {
    const normalized = normalizeNode(node);
    if (normalized !== undefined) pushMerged(out, normalized);
  }
  return out;
}

/** One node in normal form. `undefined` drops the node (empty text, empty emoji, malformed). */
function normalizeNode(node: unknown): Json | undefined {
  if (typeof node !== "object" || node === null || Array.isArray(node)) return undefined;
  const obj = node as Json;
  switch (obj["type"]) {
    case "text": {
      if (typeof obj["text"] !== "string" || obj["text"] === "") return undefined;
      return textNode(obj["text"], canonicalMarks(obj["marks"]));
    }
    case "link": {
      if (typeof obj["url"] !== "string") return undefined;
      const children = Array.isArray(obj["children"]) ? obj["children"] : [];
      const out: Json = { type: "link", url: obj["url"], children: normalizeNodes(children) };
      if (obj["openInNewTab"] === true) out["openInNewTab"] = true;
      return out;
    }
    case "mention": {
      // color and href are delivery-only and are dropped here.
      const out: Json = { type: "mention" };
      for (const key of ["entryId", "collection", "slug"]) {
        out[key] = obj[key] === undefined ? "" : obj[key];
      }
      if (obj["title"] !== undefined) out["title"] = obj["title"];
      return out;
    }
    case "emoji": {
      if (typeof obj["emoji"] !== "string" || obj["emoji"] === "") return undefined;
      const out: Json = { type: "emoji", emoji: obj["emoji"] };
      if (typeof obj["shortcode"] === "string" && obj["shortcode"] !== "")
        out["shortcode"] = obj["shortcode"];
      return out;
    }
    case "icon": {
      const out: Json = { type: "icon", name: obj["name"] === undefined ? "" : obj["name"] };
      if (obj["label"] !== undefined) out["label"] = obj["label"];
      return out;
    }
    default:
      return { ...obj };
  }
}

/** Appends `next` to `out`, merging it into the last node when Loro would have merged them. */
function pushMerged(out: Json[], next: Json): void {
  const last = out[out.length - 1];
  if (last !== undefined) {
    const merged = mergePair(last, next);
    if (merged !== undefined) {
      out[out.length - 1] = merged;
      return;
    }
  }
  out.push(next);
}

/** The merge of two adjacent normalized nodes, if they merge. */
function mergePair(last: Json, next: Json): Json | undefined {
  const kind = last["type"];
  if (next["type"] !== kind) return undefined;
  switch (kind) {
    case "text": {
      if (!deepEqual(last["marks"], next["marks"])) return undefined;
      return textNode(`${last["text"]}${next["text"]}`, canonicalMarks(last["marks"]));
    }
    case "mention":
      return deepEqual(last, next) ? last : undefined;
    case "emoji": {
      if (!deepEqual(last["shortcode"], next["shortcode"])) return undefined;
      return { ...last, emoji: `${last["emoji"]}${next["emoji"]}` };
    }
    case "link": {
      if (
        !deepEqual(last["url"], next["url"]) ||
        !deepEqual(last["openInNewTab"], next["openInNewTab"])
      )
        return undefined;
      const children: Json[] = [...(last["children"] as Json[])];
      for (const child of next["children"] as Json[]) pushMerged(children, child);
      return { ...last, children };
    }
    default:
      return undefined;
  }
}

/** Marks that are true, in canonical order, without duplicates. */
export function canonicalMarks(marks: unknown): string[] {
  const present = Array.isArray(marks)
    ? marks.filter((m): m is string => typeof m === "string")
    : [];
  return CANON_MARKS.filter((m) => present.includes(m));
}

/** A text node; `marks` is omitted when empty. */
export function textNode(text: string, marks: readonly string[]): Json {
  const out: Json = { type: "text", text };
  if (marks.length > 0) out["marks"] = [...marks];
  return out;
}
