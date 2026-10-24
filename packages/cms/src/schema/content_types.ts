import { boolean, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { Localized } from "../core/types/pages";
import type { BaseBlock } from "../core/types/blocks";

export type CollectionMode = "document" | "data" | "singleton";

export interface DynamicFieldDefinition {
  type:
    | "text"
    | "number"
    | "boolean"
    | "enum"
    | "media"
    | "relation"
    | "currency"
    | "array"
    | "json";
  label: Localized;
  description?: Localized;
  required?: boolean;
  defaultValue?: any;
  options?: { label: Localized; value: string }[];
  allowedCollections?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface EcomSettings {
  enabled: boolean;
  currencyDefault: string;
  trackInventory: boolean;
  hasVariants: boolean;
  allowDigitalDownloads: boolean;
  stripeSync?: boolean;
}

export const contentTypes = pgTable("content_types", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: jsonb("name").$type<Localized>().notNull(),
  description: jsonb("description").$type<Localized>(),
  icon: text("icon").default("i-lucide-box").notNull(),
  /** Entity colour (mention chips etc.). Null = derived from the slug. */
  color: text("color"),
  mode: text("mode").$type<CollectionMode>().default("document").notNull(),

  fieldSchema: jsonb("field_schema")
    .$type<Record<string, { label: Localized; fields: Record<string, DynamicFieldDefinition> }>>()
    .default({})
    .notNull(),

  ecomSettings: jsonb("ecom_settings").$type<EcomSettings>(),
  initialBlocks: jsonb("initial_blocks").$type<BaseBlock[]>().default([]).notNull(),
  features: jsonb("features").$type<Record<string, any>>().default({}).notNull(),
  workflow: jsonb("workflow").$type<Record<string, any>>().default({}).notNull(),
  isSystem: boolean("is_system").default(false).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
});
