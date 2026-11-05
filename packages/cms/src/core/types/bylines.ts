export type BylineRole =
  | "written_by"
  | "reviewed_by"
  | "edited_by"
  | "illustrated_by"
  | "translated_by"
  | "curated_by";

export interface BylineCredit {
  userId: string;
  role: BylineRole;
  customTitle?: string;
  displayOrder?: number;
}

/** Custom byline field kinds. `select` requires `options`. */
export type BylineFieldType = "string" | "text" | "url" | "boolean" | "select";

export const BYLINE_FIELD_TYPES: readonly BylineFieldType[] = [
  "string",
  "text",
  "url",
  "boolean",
  "select",
];

/** A single scalar field value. */
export type BylineFieldValue = string | boolean;

/**
 * Stored value in `bylines.fields[slug]`. Translatable fields store one value per locale
 * (`{ en: "...", pt: "..." }`); other fields store the value directly.
 */
export type BylineFieldStored = BylineFieldValue | Record<string, BylineFieldValue>;

/** Incoming value. `null` clears the field, or one locale of a translatable field. */
export type BylineFieldInputValue =
  | BylineFieldValue
  | Record<string, BylineFieldValue | null>
  | null;

export interface BylineFieldDefinition {
  id: string;
  slug: string;
  label: string;
  type: BylineFieldType;
  required: boolean;
  translatable: boolean;
  options: string[];
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BylineFieldInput {
  label: string;
  /** Defaults to the snake_cased label. Immutable after creation. */
  slug?: string | undefined;
  type: BylineFieldType;
  required?: boolean;
  translatable?: boolean;
  options?: string[];
}

/** Partial update. The slug is immutable and cannot be patched. */
export type BylineFieldPatch = Partial<Omit<BylineFieldInput, "slug">>;

/** Byline `fields` patch: keys set values; `null` removes them. */
export type BylineFieldsPatch = Record<string, BylineFieldInputValue>;
