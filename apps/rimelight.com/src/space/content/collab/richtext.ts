// Rich text between inline JSON and Loro text (MAPPING section 3). Mirrors `crates/rimelight_content/src/richtext.rs`.
//
// Positions: every index is read from `text.length`, never computed from string lengths, so the code does not
// depend on whether Loro counts UTF-16 units or code points. // UNSURE: confirm `LoroText` index unit in loro-crdt 1.x.

import type { LoroText } from "#loro";
import { normalizeNodes, textNode } from "./normalize";
import { CANON_MARKS, EXPAND_AFTER_MARKS, ICON_CHAR } from "./values";

type Json = Record<string, any>;

/** Appends `nodes` to `text` as rich text. Throws on an inline type this module does not know. */
export function importRich(text: LoroText, nodes: readonly unknown[]): void {
  for (const raw of nodes) {
    const node = raw as Json;
    switch (node["type"]) {
      case "text":
        putText(text, strField(node, "text"), nodeMarks(node));
        break;
      case "link": {
        const start = text.length;
        const children = Array.isArray(node["children"]) ? node["children"] : [];
        for (const child of children as Json[]) {
          putText(text, strField(child, "text"), nodeMarks(child));
        }
        const end = text.length;
        const value: Json = { url: strField(node, "url") };
        if (node["openInNewTab"] === true) value["openInNewTab"] = true;
        if (start < end) text.mark({ start, end }, "link", value);
        break;
      }
      case "mention": {
        const slug = strField(node, "slug");
        const title = typeof node["title"] === "string" ? node["title"] : undefined;
        // Title, else slug, else "@": the text is never empty.
        const label = title !== undefined && title !== "" ? title : slug !== "" ? slug : "@";
        const value: Json = {
          entryId: strField(node, "entryId"),
          collection: strField(node, "collection"),
          slug,
        };
        if (title !== undefined) value["title"] = title;
        const start = text.length;
        text.insert(start, label);
        text.mark({ start, end: text.length }, "mention", value);
        break;
      }
      case "emoji": {
        const emoji = strField(node, "emoji");
        if (emoji === "") break;
        const shortcode = typeof node["shortcode"] === "string" ? node["shortcode"] : "";
        const start = text.length;
        text.insert(start, emoji);
        text.mark({ start, end: text.length }, "emoji", shortcode);
        break;
      }
      case "icon": {
        const value: Json = { name: strField(node, "name") };
        if (typeof node["label"] === "string") value["label"] = node["label"];
        const start = text.length;
        text.insert(start, ICON_CHAR);
        text.mark({ start, end: text.length }, "icon", value);
        break;
      }
      default:
        throw new Error(`unknown inline node type: ${String(node["type"])}`);
    }
  }
}

/** Appends `s` with the given marks. The four expand-after marks are set true or false explicitly. */
function putText(text: LoroText, s: string, marks: readonly string[]): void {
  if (s === "") return;
  const start = text.length;
  text.insert(start, s);
  const end = text.length;
  for (const key of EXPAND_AFTER_MARKS) {
    text.mark({ start, end }, key, marks.includes(key));
  }
  if (marks.includes("code")) text.mark({ start, end }, "code", true);
}

/** Reads `text` back as normal-form rich text nodes (MAPPING section 3 export, then section 4). */
export function exportRich(text: LoroText): Json[] {
  const raw: Json[] = [];
  for (const item of text.toDelta()) {
    const insert = (item as { insert?: unknown }).insert;
    if (typeof insert !== "string") continue;
    const attrs: Json = (item as { attributes?: Json }).attributes ?? {};
    const marks = CANON_MARKS.filter((m) => attrs[m] === true);

    if (attrs["mention"] !== undefined) {
      // A mention run is atomic: its own text is discarded.
      raw.push({ ...attrs["mention"], type: "mention" });
    } else if (attrs["icon"] !== undefined) {
      for (const ch of insert) {
        if (ch === ICON_CHAR) raw.push({ ...attrs["icon"], type: "icon" });
      }
    } else if (attrs["emoji"] !== undefined) {
      const node: Json = { type: "emoji", emoji: insert };
      if (typeof attrs["emoji"] === "string" && attrs["emoji"] !== "")
        node["shortcode"] = attrs["emoji"];
      raw.push(node);
    } else if (attrs["link"] !== undefined) {
      // A link run is a text child of a link node; normalization merges adjacent links.
      raw.push({ ...attrs["link"], type: "link", children: [textNode(insert, marks)] });
    } else {
      raw.push(textNode(insert, marks));
    }
  }
  return normalizeNodes(raw);
}

/** Writes plain text into `text` (appends at 0; callers write into a fresh text). */
export function importPlain(text: LoroText, s: string): void {
  if (s === "") return;
  text.insert(0, s);
}

/** Plain text of `text`. */
export function exportPlain(text: LoroText): string {
  return text.toString();
}

/** The marks of an imported node that are true, in canonical order. */
function nodeMarks(node: Json): string[] {
  const present = Array.isArray(node["marks"]) ? node["marks"] : [];
  return CANON_MARKS.filter((m) => present.includes(m));
}

function strField(node: Json, key: string): string {
  return typeof node?.[key] === "string" ? node[key] : "";
}
