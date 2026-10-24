export type CollectionFieldType =
  | "text"
  | "slug"
  | "richtext"
  | "blocks"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "select"
  | "multiselect"
  | "media"
  | "reference"
  | "references"
  | "json"
  | "currency";

export interface CollectionFieldDefinition {
  id?: string;
  key: string;
  type: CollectionFieldType;
  label: Record<string, string>;
  description?: Record<string, string>;
  required?: boolean;
  unique?: boolean;
  queryable?: boolean;
  translatable?: boolean;
  options?: {
    selectOptions?: { label: Record<string, string>; value: string }[];
    referenceCollection?: string;
    currencyDefault?: string;
    allowedBlocks?: string[];
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
    };
  };
  sort?: number;
}
