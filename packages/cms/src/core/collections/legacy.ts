import type { CollectionDefinition, FieldDefinition, FieldGroup, FieldType } from "./types";

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
