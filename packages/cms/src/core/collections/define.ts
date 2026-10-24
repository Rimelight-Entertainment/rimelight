import type { BaseBlock } from "../types/blocks";
import { createBlockId } from "../blocks/tree";
import type { CollectionDefinition, FieldDefinition, Label, ResolvedCollection } from "./types";

export function defineCollection<const T extends CollectionDefinition>(def: T): T {
  return def;
}

export function defineField<const T extends FieldDefinition>(def: T): T {
  return def;
}

export function resolveLabel(label: Label | undefined | null, locale = "en"): string {
  if (!label) return "";
  if (typeof label === "string") return label;
  return label[locale] ?? label["en"] ?? Object.values(label)[0] ?? "";
}

export function resolveCollection(
  def: CollectionDefinition,
  source: ResolvedCollection["source"] = "code",
): ResolvedCollection {
  const f = def.features ?? {};
  const w = def.workflow ?? {};
  const resolved: ResolvedCollection = {
    ...def,
    kind: def.kind ?? "document",
    source,
    groups: def.groups ?? {},
    fields: def.fields ?? {},
    features: {
      blocks: f.blocks ?? def.kind !== "data",
      versioned: f.versioned ?? true,
      hierarchical: f.hierarchical ?? false,
      routable: f.routable ?? true,
      scheduled: f.scheduled ?? true,
      bylines: f.bylines ?? false,
      taxonomies: f.taxonomies ?? [],
      search: f.search ?? true,
      ecommerce: f.ecommerce ?? false,
    },
    workflow: {
      minApprovals: w.minApprovals ?? 0,
      allowSelfApproval: w.allowSelfApproval ?? true,
      ...(w.requiredRolesForApproval
        ? { requiredRolesForApproval: w.requiredRolesForApproval }
        : {}),
    },
  };
  return resolved;
}

/** Fresh initial blocks for a new entry, with new ids every call. */
export function instantiateInitialBlocks(collection: CollectionDefinition): BaseBlock[] {
  const raw =
    typeof collection.initialBlocks === "function"
      ? collection.initialBlocks()
      : (collection.initialBlocks ?? []);
  const reId = (blocks: BaseBlock[]): BaseBlock[] =>
    blocks.map((b) => ({
      ...b,
      id: createBlockId(),
      ...(b.children ? { children: reId(b.children) } : {}),
    }));
  return reId(structuredClone(raw));
}

/** Default property values for a new entry. */
export function defaultProperties(collection: ResolvedCollection): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(collection.fields)) {
    if (field.defaultValue !== undefined) out[key] = structuredClone(field.defaultValue);
  }
  return out;
}
