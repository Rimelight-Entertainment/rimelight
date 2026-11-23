// Block registry lookup for the Loro mapping (MAPPING section 2, "Which props are text").
// The registry JSON is the package copy of `crates/rimelight_content/registry/blocks.json`.

import registryFile from "../registry/blocks.json";

export type TextKind = "rich" | "plain";

interface FieldDef {
  type: string;
  [key: string]: unknown;
}

interface BlockDef {
  type: string;
  inlineText?: string | null;
  richText?: boolean;
  fields?: Record<string, FieldDef>;
  [key: string]: unknown;
}

const blocks: BlockDef[] = (registryFile as { blocks: BlockDef[] }).blocks;

/** The first registry entry with `blockType`, if any. Unknown types return `undefined`. */
export function blockDef(blockType: string): BlockDef | undefined {
  return blocks.find((def) => def.type === blockType);
}

/**
 * Storage kind of one prop of one block type. Returns `null` for every prop that is not text: non-text props,
 * props of unknown block types, and props missing from the registry. Callers store those as plain JSON (`p:`).
 */
export function textKind(blockType: string, prop: string): TextKind | null {
  const def = blockDef(blockType);
  if (!def) return null;
  if (blockType === "CodeBlock" && prop === "code") return "plain";
  const field = def.fields?.[prop];
  if (field) {
    if (field.type === "richtext") return "rich";
    if (field.type === "text" || field.type === "textarea") return "plain";
  }
  if (def.inlineText === prop) return def.richText === true ? "rich" : "plain";
  return null;
}
