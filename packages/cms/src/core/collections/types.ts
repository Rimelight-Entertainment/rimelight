import type { BaseBlock } from "../types/blocks";
import type { Localized } from "../types/pages";

/** A label that is either a plain string or a per-locale map (`{ en: "Title" }`). */
export type Label = string | Localized;

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "slug"
  | "url"
  | "email"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "select"
  | "multiselect"
  | "tags"
  | "color"
  | "media"
  | "reference"
  | "references"
  | "currency"
  | "json";

export interface FieldOption {
  label: Label;
  value: string;
}

/**
 * One typed property on a collection entry. Values live in `entry.content.properties[key]`.
 */
export interface FieldDefinition {
  type: FieldType;
  label: Label;
  description?: Label;
  required?: boolean;
  defaultValue?: unknown;
  /** Group key (see `CollectionDefinition.groups`). Ungrouped fields render under "General". */
  group?: string;
  /** Options for `select` / `multiselect`. */
  options?: FieldOption[];
  /** Target collection slugs for `reference` / `references`. */
  collections?: string[];
  /** Per-locale value (`{ en, pt }`) instead of a single value. */
  translatable?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  /** Default ISO currency for `currency` fields. */
  currency?: string;
}

export interface FieldGroup {
  label: Label;
  defaultOpen?: boolean;
}

export interface EcommerceSettings {
  currency: string;
  trackInventory?: boolean;
  hasVariants?: boolean;
  digitalDownloads?: boolean;
}

export interface CollectionFeatures {
  /** Entries are edited with the block editor (otherwise fields-only, like a database row). */
  blocks?: boolean;
  /** Publishing creates immutable versions; drafts are kept separately. */
  versioned?: boolean;
  /** Entries can have a parent entry (wiki trees, docs sections). */
  hierarchical?: boolean;
  /** Entries have public URLs. A string is a pattern like "/blog/{slug}". */
  routable?: boolean | string;
  /** Entries can be scheduled for future publishing. */
  scheduled?: boolean;
  /** Entries carry author/contributor bylines. */
  bylines?: boolean;
  /** Taxonomies that apply (e.g. ["category", "tag"]). */
  taxonomies?: string[];
  /** Indexed for full-text search. */
  search?: boolean;
  /** Product-style collection: prices, inventory, variants. */
  ecommerce?: EcommerceSettings | false;
}

export interface CollectionWorkflow {
  minApprovals?: number;
  allowSelfApproval?: boolean;
  requiredRolesForApproval?: string[];
}

export type CollectionKind = "document" | "singleton" | "data";

export interface CollectionDefinition {
  /** Stored as `pages.type`. */
  slug: string;
  label: Label;
  labelPlural?: Label;
  description?: Label;
  icon?: string;
  /**
   * The collection's colour (any CSS colour). Mentions of its entries use it, so every entry
   * type is recognizable at a glance. Defaults to a stable colour derived from the slug.
   */
  color?: string;
  kind?: CollectionKind;
  features?: CollectionFeatures;
  workflow?: CollectionWorkflow;
  groups?: Record<string, FieldGroup>;
  fields?: Record<string, FieldDefinition>;
  /** Block types allowed at the root of entries. Defaults to every registered block. */
  allowedBlocks?: string[];
  /** Blocks seeded into new entries. A function is called per entry so ids stay unique. */
  initialBlocks?: BaseBlock[] | (() => BaseBlock[]);
}

/** A collection after defaults are applied. This is what services and the dashboard consume. */
export interface ResolvedCollection extends CollectionDefinition {
  kind: CollectionKind;
  /** Always set: the explicit colour or the derived one. */
  color: string;
  features: Required<Omit<CollectionFeatures, "ecommerce" | "routable">> & {
    routable: boolean | string;
    ecommerce: EcommerceSettings | false;
  };
  workflow: Required<Omit<CollectionWorkflow, "requiredRolesForApproval">> &
    Pick<CollectionWorkflow, "requiredRolesForApproval">;
  groups: Record<string, FieldGroup>;
  fields: Record<string, FieldDefinition>;
  /** Where the definition came from. Database collections are editable in the dashboard. */
  source: "code" | "database";
  /** Row id when `source === "database"`. */
  id?: string;
}
