import type { BaseBlock } from "../core/types/blocks";
import type { InlineNode } from "../core/types/inline";

/**
 * Upgrade of stored content to the rich text model (data migration 0007):
 *
 * - `page_mention` nodes become `mention` nodes carrying the entry's collection (looked up from
 *   the pages table), so they can be coloured by entity type. Existing `mention` nodes get their
 *   collection/slug refreshed from the same lookup.
 * - Text props that are now rich (section titles, step titles, dialogue lines, scene and section
 *   descriptions) are converted from strings — keeping per-locale maps as per-locale maps.
 * - `SectionBlock.props.level` is dropped: heading levels come from nesting.
 */

export type EntryLookup = Map<string, { collection: string; slug: string }>;

/** Props that hold rich text, by block type. Paragraph/list text was already rich. */
export const RICH_TEXT_PROPS: Record<string, string[]> = {
  ParagraphBlock: ["text"],
  ListItemBlock: ["content"],
  SectionBlock: ["title", "description"],
  StepItemBlock: ["title"],
  DialogueBlock: ["line"],
  SceneBlock: ["description"],
};

const isNodeArray = (v: unknown): v is any[] =>
  Array.isArray(v) && v.every((n) => n && typeof n === "object" && typeof n.type === "string");

function upgradeNode(raw: any, lookup: EntryLookup): InlineNode | null {
  if (!raw || typeof raw !== "object") return null;
  if (raw.type === "page_mention" || raw.type === "mention") {
    const entryId = String(raw.entryId ?? raw.pageId ?? "");
    const found = lookup.get(entryId);
    const title = raw.title ?? raw.displayTitle;
    return {
      type: "mention",
      entryId,
      collection: found?.collection ?? raw.collection ?? "page",
      slug: found?.slug ?? raw.slug ?? raw.pageSlug ?? "",
      ...(title ? { title: String(title) } : {}),
    };
  }
  if (raw.type === "user_mention") {
    const label = raw.displayName ?? raw.title ?? raw.name;
    return label ? { type: "text", text: `@${label}` } : null;
  }
  if (raw.type === "link") {
    return {
      ...raw,
      children: (raw.children ?? []).filter((c: any) => c?.type === "text"),
    };
  }
  return raw as InlineNode;
}

const upgradeNodes = (nodes: any[], lookup: EntryLookup) =>
  nodes.map((n) => upgradeNode(n, lookup)).filter((n): n is InlineNode => !!n);

/** Any text-ish value → rich text, keeping localized maps localized. */
function toRich(value: unknown, lookup: EntryLookup): unknown {
  if (value == null) return [];
  if (isNodeArray(value)) return upgradeNodes(value, lookup);
  if (typeof value === "string") return value ? [{ type: "text", text: value }] : [];
  if (typeof value === "object" && !Array.isArray(value)) {
    const out: Record<string, unknown> = {};
    for (const [locale, v] of Object.entries(value)) out[locale] = toRich(v, lookup);
    return out;
  }
  return value;
}

/** Inline arrays (or localized maps of them) anywhere in props get their nodes upgraded. */
function upgradeAnyInline(value: unknown, lookup: EntryLookup): unknown {
  if (isNodeArray(value) && value.some((n) => "text" in n || "url" in n || "pageId" in n))
    return upgradeNodes(value, lookup);
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const entries = Object.entries(value);
    if (entries.length && entries.every(([, v]) => isNodeArray(v)))
      return Object.fromEntries(entries.map(([k, v]) => [k, upgradeNodes(v as any[], lookup)]));
  }
  return value;
}

export function upgradeRichTextBlocks(blocks: unknown, lookup: EntryLookup): BaseBlock[] {
  if (!Array.isArray(blocks)) return [];
  return blocks.map((block: any) => {
    const props: Record<string, unknown> = { ...block.props };
    if (block.type === "SectionBlock") delete props["level"];
    const rich = new Set(RICH_TEXT_PROPS[block.type] ?? []);
    for (const [k, v] of Object.entries(props))
      props[k] = rich.has(k) ? toRich(v, lookup) : upgradeAnyInline(v, lookup);
    const next: BaseBlock = { ...block, props };
    if (Array.isArray(block.children))
      next.children = upgradeRichTextBlocks(block.children, lookup);
    return next;
  });
}

export function upgradeRichTextContent(raw: unknown, lookup: EntryLookup) {
  const c = (typeof raw === "string" ? JSON.parse(raw || "{}") : (raw ?? {})) as any;
  const properties: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(c.properties ?? {}))
    properties[k] = upgradeAnyInline(v, lookup);
  return { ...c, blocks: upgradeRichTextBlocks(c.blocks, lookup), properties };
}
