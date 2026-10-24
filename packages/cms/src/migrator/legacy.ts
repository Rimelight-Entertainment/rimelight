import type { CollectionDefinition, FieldDefinition, FieldGroup, FieldType } from "../core/collections/types";

/**
 * Converters from the two older schema formats into `CollectionDefinition`:
 * - `content_types.field_schema` rows: `{ [group]: { label, fields: { [key]: { type, label, ... } } } }`
 * - `PageDefinition` objects (`properties: { [group]: { label, defaultOpen, fields } }`)
 */

const LEGACY_TYPES: Record<string, FieldType> = {
  enum: "select",
  relation: "reference",
  array: "tags",
  "text-array": "tags",
  page: "reference",
  "page-array": "references",
};

function convertField(raw: any, group: string): FieldDefinition {
  const type = (LEGACY_TYPES[raw?.type] ?? raw?.type ?? "text") as FieldType;
  const field: FieldDefinition = { type, label: raw?.label ?? "", group };
  if (raw?.description) field.description = raw.description;
  if (raw?.required) field.required = true;
  if (raw?.defaultValue !== undefined) field.defaultValue = raw.defaultValue;
  if (Array.isArray(raw?.options)) {
    field.options = raw.options.map((o: any) => {
      if (o && typeof o === "object" && "value" in o) return { label: o.label ?? o.value, value: String(o.value) };
      const text = typeof o === "string" ? o : (o?.en ?? Object.values(o ?? {})[0] ?? "");
      return { label: o, value: String(text) };
    });
  }
  const targets = raw?.allowedCollections ?? raw?.allowedPageTypes;
  if (Array.isArray(targets)) field.collections = targets;
  if (raw?.validation) Object.assign(field, raw.validation);
  return field;
}

/** Groups-of-fields shape used by both legacy formats. */
export function fieldsFromGroups(groups: Record<string, any> | null | undefined): {
  groups: Record<string, FieldGroup>;
  fields: Record<string, FieldDefinition>;
} {
  const out = { groups: {} as Record<string, FieldGroup>, fields: {} as Record<string, FieldDefinition> };
  for (const [groupKey, group] of Object.entries(groups ?? {})) {
    if (!group || typeof group !== "object") continue;
    out.groups[groupKey] = { label: group.label ?? groupKey, defaultOpen: group.defaultOpen ?? true };
    for (const [key, raw] of Object.entries(group.fields ?? {})) {
      out.fields[key] = convertField(raw, groupKey);
    }
  }
  return out;
}

/** Normalizes a `content_types.field_schema` value (new or legacy) into groups + fields. */
export function parseFieldSchema(schema: unknown): {
  groups: Record<string, FieldGroup>;
  fields: Record<string, FieldDefinition>;
} {
  const s = (typeof schema === "string" ? JSON.parse(schema || "{}") : schema) as any;
  if (s && typeof s === "object" && s.fields && typeof s.fields === "object" && !s.fields.label) {
    const values = Object.values(s.fields) as any[];
    if (values.every((f) => f && typeof f.type === "string")) {
      return { groups: s.groups ?? {}, fields: s.fields };
    }
  }
  if (Array.isArray(s)) {
    // Very old migrator format: [{ key, type, label }]
    const fields: Record<string, FieldDefinition> = {};
    for (const f of s) if (f?.key) fields[f.key] = convertField(f, "general");
    return { groups: {}, fields };
  }
  return fieldsFromGroups(s);
}

/** Legacy `PageDefinition` → collection. */
export function collectionFromPageDefinition(
  slug: string,
  def: { typeLabelKey?: string; properties?: Record<string, any>; initialBlocks?: () => any[] },
  label?: string,
): CollectionDefinition {
  const { groups, fields } = fieldsFromGroups(def.properties);
  return {
    slug,
    label: label ?? slug,
    groups,
    fields,
    ...(def.initialBlocks ? { initialBlocks: def.initialBlocks } : {}),
  };
}

// ─── Content normalization (one-time, used only by migration 0003) ─────────────

import type { BaseBlock } from "../core/types/blocks";

const kebab = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Historic `pages.type` values → collection slugs. */
const TYPE_RENAMES: Record<string, string> = {
  "blog-post": "blog",
  post: "blog",
  article: "blog",
  document: "doc",
  docs: "doc",
  default: "page",
  landing: "page",
  announcement: "blog",
};
export const canonicalType = (type: string) => {
  const k = kebab(type || "page");
  return TYPE_RENAMES[k] ?? k;
};

/** Text props that used to be stored as a string or `{ en: "..." }` and are now InlineNode[]. */
const RICH_TEXT: Record<string, string> = { ParagraphBlock: "text", ListItemBlock: "content" };

function toInline(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value ? [{ type: "text", text: value }] : [];
  if (value && typeof value === "object") {
    const rec = value as Record<string, unknown>;
    const t = rec["en"] ?? Object.values(rec)[0];
    return typeof t === "string" && t ? [{ type: "text", text: t }] : [];
  }
  return [];
}

const RENAMED_BLOCKS: Record<string, string> = { HeadingBlock: "SectionBlock" };

/** Legacy block trees → canonical: `children` (not `props.children`), inline text, valid ids. */
export function normalizeLegacyBlocks(input: unknown): BaseBlock[] {
  let list = input;
  if (typeof list === "string") {
    try {
      list = JSON.parse(list);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(list)) return [];
  const nested = new Set<string>();
  const collect = (bs: any[]) => {
    for (const b of bs ?? []) {
      const kids = b?.children ?? b?.props?.children ?? [];
      for (const k of kids) if (k?.id) nested.add(k.id);
      collect(kids);
    }
  };
  collect(list as any[]);
  const seen = new Set<string>();
  const visit = (raw: any): BaseBlock | null => {
    if (!raw || typeof raw !== "object" || typeof raw.type !== "string") return null;
    const { children: legacyKids, level: _level, content, ...props } = raw.props ?? {};
    const type = RENAMED_BLOCKS[raw.type] ?? raw.type;
    if (raw.type === "HeadingBlock") props["title"] = props["text"] ?? props["title"] ?? "";
    const textKey = RICH_TEXT[type];
    if (textKey === "text") props["text"] = toInline(props["text"] ?? content);
    else if (textKey === "content") props["content"] = toInline(content);
    else if (content !== undefined) props["content"] = content;
    const id = typeof raw.id === "string" && raw.id && !seen.has(raw.id) ? raw.id : crypto.randomUUID();
    seen.add(id);
    const kids = (Array.isArray(raw.children) ? raw.children : Array.isArray(legacyKids) ? legacyKids : null)
      ?.map(visit)
      .filter(Boolean) as BaseBlock[] | undefined;
    const block: BaseBlock = { ...raw, id, type, props };
    if (kids) block.children = kids;
    else delete block.children;
    return block;
  };
  return (list as any[]).filter((b) => !(b?.id && nested.has(b.id))).map(visit).filter((b): b is BaseBlock => !!b);
}

export function normalizeLegacyContent(raw: unknown): { blocks: BaseBlock[]; properties: Record<string, unknown> } {
  const c = (typeof raw === "string" ? JSON.parse(raw || "{}") : raw ?? {}) as any;
  return { blocks: normalizeLegacyBlocks(c.blocks), properties: c.properties ?? {} };
}

/** Templates stored property *definitions* as defaults; keep only the default values. */
export function flattenTemplateDefaults(defaults: unknown): Record<string, unknown> {
  const d = (typeof defaults === "string" ? JSON.parse(defaults || "{}") : defaults ?? {}) as Record<string, any>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(d)) {
    if (v && typeof v === "object" && "fields" in v) {
      for (const [fk, f] of Object.entries((v as any).fields ?? {})) {
        const dv = (f as any)?.defaultValue;
        if (dv !== undefined) out[fk] = dv && typeof dv === "object" && "en" in dv ? dv.en : dv;
      }
    } else out[k] = v;
  }
  return out;
}
