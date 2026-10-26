import type {
  InlineNode,
  LocalizedRichText,
  RichText,
  RichTextValue,
  TextInlineNode,
} from "./types/inline";

/**
 * Helpers for rich text values (`InlineNode[]` or a per-locale map of them). Pure functions,
 * shared by the editor, renderers, search indexing, excerpts and markdown export.
 */

const INLINE_TYPES = new Set(["text", "link", "mention", "emoji", "icon"]);

export const isInlineNode = (v: unknown): v is InlineNode =>
  !!v && typeof v === "object" && INLINE_TYPES.has((v as any).type);

/** `{ en: [...], pt: [...] }` rather than a node array. */
export function isLocalizedRichText(value: unknown): value is LocalizedRichText {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.values(value).every((v) => Array.isArray(v))
  );
}

/** Normalizes anything text-like into nodes: arrays pass through, strings become one text node. */
export function toRichText(value: unknown): RichText {
  if (Array.isArray(value)) return value.filter(isInlineNode);
  if (typeof value === "string") return value ? [{ type: "text", text: value }] : [];
  if (typeof value === "number") return [{ type: "text", text: String(value) }];
  return [];
}

/** The nodes for `locale` (falling back to `fallback`, then the first locale present). */
export function resolveRichText(value: unknown, locale = "en", fallback = "en"): RichText {
  if (isLocalizedRichText(value)) {
    const nodes = value[locale]?.length
      ? value[locale]
      : value[fallback]?.length
        ? value[fallback]
        : Object.values(value)[0];
    return toRichText(nodes);
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    // A localized plain-string map ({ en: "…" }).
    const rec = value as Record<string, unknown>;
    return toRichText(rec[locale] ?? rec[fallback] ?? Object.values(rec)[0]);
  }
  return toRichText(value);
}

/**
 * Writes `nodes` for `locale` into `previous`, keeping its shape: a localized map stays a map
 * (other locales untouched); a plain array is replaced — unless `translatable`, which starts a map.
 */
export function updateRichText(
  previous: unknown,
  locale: string,
  nodes: RichText,
  {
    translatable = false,
    defaultLocale = "en",
  }: { translatable?: boolean; defaultLocale?: string } = {},
): RichTextValue {
  if (isLocalizedRichText(previous)) return { ...previous, [locale]: nodes };
  if (locale === defaultLocale) return translatable ? { [locale]: nodes } : nodes;
  // A translation of plain text: the existing text stays under the default locale, so editing
  // `pt` never overwrites `en`.
  // Copy: `previous` may be a store proxy, which structuredClone (used by the editor) rejects.
  return { [defaultLocale]: toRichText(plainCopy(previous)), [locale]: nodes };
}

/** A detached JSON copy: strips store proxies so the value can be cloned and stored. */
const plainCopy = <T>(value: T): T =>
  value === undefined ? value : JSON.parse(JSON.stringify(value));

export function inlineToPlainText(nodes: readonly InlineNode[]): string {
  return nodes
    .map((n) => {
      switch (n.type) {
        case "text":
          return n.text ?? "";
        case "link":
          return inlineToPlainText(n.children ?? []);
        case "mention":
          return n.title || n.slug || "";
        case "emoji":
          return n.emoji ?? "";
        default:
          return "";
      }
    })
    .join("");
}

/** Plain text of any rich (or plain / localized) text value. */
export function richTextToPlain(value: unknown, locale = "en"): string {
  return inlineToPlainText(resolveRichText(value, locale));
}

export const isRichTextEmpty = (value: unknown, locale = "en"): boolean =>
  richTextToPlain(value, locale).trim() === "" &&
  !resolveRichText(value, locale).some((n) => n.type === "icon");

/** Merges adjacent text nodes with identical marks and drops empty ones. */
export function compactRichText(nodes: RichText): RichText {
  const out: RichText = [];
  for (const node of nodes) {
    if (node.type === "text" && !node.text) continue;
    const last = out[out.length - 1];
    if (
      node.type === "text" &&
      last?.type === "text" &&
      JSON.stringify(last.marks ?? []) === JSON.stringify(node.marks ?? [])
    ) {
      out[out.length - 1] = { ...last, text: last.text + node.text } as TextInlineNode;
    } else out.push(node);
  }
  return out;
}

/** Removes delivery-only mention fields (`color`, `href`) anywhere in a value before saving. */
export function stripResolvedMentions<T>(value: T): T {
  if (Array.isArray(value)) return value.map(stripResolvedMentions) as T;
  if (value && typeof value === "object") {
    const rec = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    const mention = rec["type"] === "mention";
    for (const [k, v] of Object.entries(rec))
      if (!(mention && (k === "color" || k === "href"))) out[k] = stripResolvedMentions(v);
    return out as T;
  }
  return value;
}

/** Every entry mentioned in a value (for backlinks / "what links here"). */
export function collectMentions(value: unknown): { entryId: string; collection: string }[] {
  const nodes = isLocalizedRichText(value) ? Object.values(value).flat() : toRichText(value);
  return nodes
    .filter((n): n is Extract<InlineNode, { type: "mention" }> => n.type === "mention")
    .map(({ entryId, collection }) => ({ entryId, collection }));
}

/** Every distinct entry id mentioned anywhere in `value` (blocks, props, nested rich text). */
export function collectMentionIds(value: unknown): string[] {
  const ids = new Set<string>();
  const walk = (v: unknown) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") {
      const rec = v as Record<string, unknown>;
      if (rec["type"] === "mention" && typeof rec["entryId"] === "string") ids.add(rec["entryId"]);
      else Object.values(rec).forEach(walk);
    }
  };
  walk(value);
  return [...ids];
}
