// Page JSON <-> Loro document (MAPPING sections 2 and 5). Mirrors `crates/rimelight_content/src/doc.rs`.
//
// Layout: root map `meta` (slug, type, template fields, `title:<locale>` and `description:<locale>` text, the
// `properties` child map), and root tree `blocks` (fractional index, one node per block, node data in `node.data`).

import { LoroDoc, LoroList, LoroMap, LoroText } from "loro-crdt";
import type { LoroTreeNode } from "loro-crdt";
import { exportPlain, exportRich, importPlain, importRich } from "./richtext";
import { textKind } from "./registry";
import { isLocaleCode, isPlain, isRich, localizedMap } from "./values";

type Json = Record<string, any>;

/** Lock and visibility keys of a block: plain values in the tree node's data, only when present in the JSON. */
const BLOCK_LOCK_KEYS = [
  "isTemplated",
  "templatedProps",
  "allowedRoles",
  "requiredPermission",
  "visibility",
] as const;

/** Applies the text style config (MAPPING section 2). Required on every document before editing. */
export function configure(doc: LoroDoc): void {
  doc.configTextStyle({
    bold: { expand: "after" },
    italic: { expand: "after" },
    underline: { expand: "after" },
    strikethrough: { expand: "after" },
    code: { expand: "none" },
    link: { expand: "none" },
    mention: { expand: "none" },
    emoji: { expand: "none" },
    icon: { expand: "none" },
  });
}

/**
 * Builds a Loro document from published page JSON. Input is not normalized first, so export returns the normal
 * form of the input.
 */
export function importPage(page: Json): LoroDoc {
  const doc = new LoroDoc();
  configure(doc);

  const meta = page?.["meta"];
  if (typeof meta !== "object" || meta === null || Array.isArray(meta))
    throw shape("meta must be an object");
  const content = page["content"];
  if (typeof content !== "object" || content === null) throw shape("content must be an object");
  if (!Array.isArray(content.blocks)) throw shape("content.blocks must be an array");
  if (typeof content.properties !== "object" || content.properties === null) {
    throw shape("content.properties must be an object");
  }

  const metaMap = doc.getMap("meta");
  for (const [key, value] of Object.entries(meta as Json)) {
    if (key === "properties") throw shape("meta.properties is reserved for content.properties");
    const locales = key === "title" || key === "description" ? localizedStrings(value) : undefined;
    if (locales) {
      for (const [locale, text] of Object.entries(locales)) {
        const node = metaMap.setContainer(`${key}:${locale}`, new LoroText());
        importPlain(node, text);
      }
    } else {
      setPlain(metaMap, key, value);
    }
  }
  writeProperties(metaMap, content.properties as Json);

  const tree = doc.getTree("blocks");
  tree.enableFractionalIndex(0);
  writeBlocks(tree, content.blocks);
  doc.commit();
  return doc;
}

/**
 * Replaces the page's content in an existing document (the blocks tree and meta.properties) in one commit. Meta
 * fields (slug, type, title, description) are kept. The blocks are written by the same code as importPage. The
 * JSON is checked first, on a scratch document, so a bad block leaves the live document untouched.
 */
export function replaceContent(doc: LoroDoc, content: Json): void {
  importPage({ meta: {}, content });

  doc.commit();
  const metaMap = doc.getMap("meta");
  const tree = doc.getTree("blocks");
  for (const root of tree.roots()) tree.delete(root.id);
  writeProperties(metaMap, content["properties"] as Json);
  writeBlocks(tree, content["blocks"]);
  doc.commit();
}

/** The properties child map of meta, rebuilt from the JSON (MAPPING section 2). */
function writeProperties(metaMap: LoroMap, properties: Json): void {
  const props = metaMap.setContainer("properties", new LoroMap());
  for (const [key, value] of Object.entries(properties)) {
    setPlain(props, key, value);
  }
}

/** Appends the blocks (and their children) as roots of the tree, in order. */
function writeBlocks(tree: ReturnType<LoroDoc["getTree"]>, blocks: unknown[]): void {
  for (const block of blocks) {
    importBlock(tree, undefined, block);
  }
}

/** Published page JSON from a Loro document. Output is in normal form (MAPPING section 4). */
export function exportPage(doc: LoroDoc): { meta: Json; content: Json } {
  doc.commit();
  const metaMap = doc.getMap("meta");

  const metaOut: Json = {};
  const titles: Json = {};
  const descriptions: Json = {};
  for (const key of metaMap.keys()) {
    if (key === "properties") continue;
    const entry = metaMap.get(key);
    if (entry instanceof LoroText) {
      const value = exportPlain(entry);
      if (key.startsWith("title:")) titles[key.slice("title:".length)] = value;
      else if (key.startsWith("description:"))
        descriptions[key.slice("description:".length)] = value;
      else metaOut[key] = value;
    } else if (!isContainer(entry)) {
      metaOut[key] = entry;
    }
  }
  if (Object.keys(titles).length > 0) metaOut["title"] = titles;
  if (Object.keys(descriptions).length > 0) metaOut["description"] = descriptions;

  const properties: Json = {};
  const propsMap = metaMap.get("properties");
  if (propsMap instanceof LoroMap) {
    for (const key of propsMap.keys()) {
      const value = propsMap.get(key);
      if (!isContainer(value)) properties[key] = value;
    }
  }

  const tree = doc.getTree("blocks");
  const blocks = tree.roots().map(exportBlock);

  return { meta: metaOut, content: { blocks, properties } };
}

/** A draft: a fork of `main` with the text style config applied. */
export function forkDraft(main: LoroDoc): LoroDoc {
  const draft = main.fork();
  configure(draft);
  return draft;
}

/** Publishes a draft: imports the draft's updates that `main` does not have yet (MAPPING section 5). */
export function mergeDraft(main: LoroDoc, draft: LoroDoc): void {
  main.commit();
  draft.commit();
  const updates = draft.export({ mode: "update", from: main.oplogVersion() });
  main.import(updates);
}

/** Brings a draft up to date with `main` (MAPPING section 5). */
export function catchUp(draft: LoroDoc, main: LoroDoc): void {
  main.commit();
  draft.commit();
  const updates = main.export({ mode: "update", from: draft.oplogVersion() });
  draft.import(updates);
}

function importBlock(
  tree: ReturnType<LoroDoc["getTree"]>,
  parent: LoroTreeNode["id"] | undefined,
  block: unknown,
): void {
  if (typeof block !== "object" || block === null || Array.isArray(block))
    throw shape("block must be an object");
  const obj = block as Json;
  const id = requiredString(obj, "id");
  const blockType = requiredString(obj, "type");
  const props = obj["props"];
  if (typeof props !== "object" || props === null || Array.isArray(props)) {
    throw shape("block props must be an object");
  }

  const node = tree.createNode(parent);
  const meta = node.data;
  setPlain(meta, "id", id);
  setPlain(meta, "type", blockType);
  for (const key of BLOCK_LOCK_KEYS) {
    if (obj[key] !== undefined) setPlain(meta, key, obj[key]);
  }
  for (const [key, value] of Object.entries(props as Json)) {
    importProp(meta, blockType, key, value);
  }
  if (Array.isArray(obj["children"])) {
    for (const child of obj["children"]) importBlock(tree, node.id, child);
  }
}

/** Stores one prop by the rules of MAPPING section 2. A value that does not fit its text kind is stored as `p:`. */
function importProp(meta: LoroMap, blockType: string, key: string, value: unknown): void {
  if (blockType === "TableBlock" && key === "rows" && rowsOk(value)) {
    importRows(meta, value as Json[]);
    return;
  }
  const kind = textKind(blockType, key);
  if (kind === "rich" && isRich(value)) {
    const locales = localizedMap(value);
    if (locales) {
      for (const [locale, nodes] of Object.entries(locales)) {
        importRich(meta.setContainer(`t:${key}:${locale}`, new LoroText()), asNodes(nodes));
      }
    } else {
      importRich(meta.setContainer(`t:${key}`, new LoroText()), asNodes(value));
    }
    return;
  }
  if (kind === "plain" && isPlain(value)) {
    if (typeof value === "string") {
      importPlain(meta.setContainer(`t:${key}`, new LoroText()), value);
    } else {
      for (const [locale, s] of Object.entries(localizedMap(value) ?? {})) {
        importPlain(
          meta.setContainer(`t:${key}:${locale}`, new LoroText()),
          typeof s === "string" ? s : "",
        );
      }
    }
    return;
  }
  setPlain(meta, `p:${key}`, value);
}

/** TableBlock rows: a Loro list of maps, one Loro text per column. */
function importRows(meta: LoroMap, rows: Json[]): void {
  const list = meta.setContainer("rows", new LoroList());
  rows.forEach((row, index) => {
    const rowMap = list.insertContainer(index, new LoroMap());
    for (const [column, cell] of Object.entries(row)) {
      importPlain(
        rowMap.setContainer(column, new LoroText()),
        typeof cell === "string" ? cell : "",
      );
    }
  });
}

function rowsOk(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.every(
      (row) =>
        typeof row === "object" &&
        row !== null &&
        !Array.isArray(row) &&
        Object.values(row).every((cell) => typeof cell === "string"),
    )
  );
}

function exportBlock(node: LoroTreeNode): Json {
  const meta = node.data;
  const block: Json = {};
  const props: Json = {};
  // (prop, locale, text) for every `t:` key.
  const texts: [string, string | undefined, LoroText][] = [];

  for (const key of meta.keys()) {
    const entry = meta.get(key);
    if (key === "rows") {
      if (entry instanceof LoroList) props["rows"] = exportRows(entry);
    } else if (key.startsWith("p:")) {
      if (!isContainer(entry)) props[key.slice(2)] = entry;
    } else if (key.startsWith("t:")) {
      if (entry instanceof LoroText) {
        const rest = key.slice(2);
        const split = splitLocale(rest);
        if (split) texts.push([split.prop, split.locale, entry]);
        else texts.push([rest, undefined, entry]);
      }
    } else if (
      key === "id" ||
      key === "type" ||
      (BLOCK_LOCK_KEYS as readonly string[]).includes(key)
    ) {
      if (!isContainer(entry)) block[key] = entry;
    }
  }

  const blockType = typeof block["type"] === "string" ? block["type"] : "";
  for (const [prop, locale, text] of texts) {
    const value = textKind(blockType, prop) === "rich" ? exportRich(text) : exportPlain(text);
    if (locale === undefined) {
      props[prop] = value;
    } else {
      props[prop] ??= {};
      props[prop][locale] = value;
    }
  }

  const children = (node.children() ?? []).map(exportBlock);
  block["props"] = props;
  if (children.length > 0) block["children"] = children;
  return block;
}

function exportRows(list: LoroList): Json[] {
  const rows: Json[] = [];
  for (let index = 0; index < list.length; index++) {
    const row = list.get(index);
    if (!(row instanceof LoroMap)) continue;
    const cells: Json = {};
    for (const column of row.keys()) {
      const cell = row.get(column);
      if (cell instanceof LoroText) cells[column] = exportPlain(cell);
    }
    rows.push(cells);
  }
  return rows;
}

/** `<prop>:<locale>` (from a `t:` key) -> prop and locale, when the suffix is a locale code. */
function splitLocale(rest: string): { prop: string; locale: string } | undefined {
  const at = rest.lastIndexOf(":");
  if (at < 0) return undefined;
  const locale = rest.slice(at + 1);
  return isLocaleCode(locale) ? { prop: rest.slice(0, at), locale } : undefined;
}

/** A localized title or description: a non-empty object whose values are all strings. */
function localizedStrings(value: unknown): Json | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined;
  const entries = Object.values(value as Json);
  return entries.length > 0 && entries.every((v) => typeof v === "string")
    ? (value as Json)
    : undefined;
}

function asNodes(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function setPlain(map: LoroMap, key: string, value: unknown): void {
  map.set(key, value as any);
}

function requiredString(obj: Json, key: string): string {
  if (typeof obj[key] !== "string") throw shape(`block ${key} must be a string`);
  return obj[key];
}

function isContainer(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { kind?: unknown }).kind === "function"
  );
}

function shape(message: string): Error {
  return new Error(message);
}
