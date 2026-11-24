/**
 * Pure helpers for the page template routes (CMS.6, decision 0049): body validation for the page_templates table
 * (packages/cms/src/schema/page_templates.ts). Kept apart from content-templates.ts so the tests load without the
 * database module.
 *
 * Mapping: collection -> page_type, title / description -> localized jsonb, initialBlocks -> initial_blocks.
 */

import { SLUG_RE } from "./content-collections-logic.ts";

const TITLE_MAX = 200;

export type Localized = Record<string, string>;

export type TemplateValues = {
  slug?: string;
  title?: Localized;
  description?: Localized | null;
  pageType?: string;
  initialBlocks?: Record<string, unknown>[];
  allowedRoles?: string[];
  requiredPermission?: string | null;
  defaultProperties?: Record<string, unknown>;
};

export type TemplateParse = { ok: true; values: TemplateValues } | { ok: false; message: string };

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** A localized text: a plain string (stored under `en`) or an object of locale to string. Null when not valid. */
export function localizedText(raw: unknown, max: number): Localized | null {
  if (typeof raw === "string") {
    const t = raw.trim();
    if (t.length < 1 || Array.from(t).length > max) return null;
    return { en: t };
  }
  if (!isPlainObject(raw)) return null;
  const out: Localized = {};
  for (const [locale, text] of Object.entries(raw)) {
    if (typeof text !== "string") return null;
    const t = text.trim();
    if (t.length > 0) {
      if (Array.from(t).length > max) return null;
      out[locale] = t;
    }
  }
  return Object.keys(out).length > 0 ? out : null;
}

/** True when every item is an object with a non-empty string `type` (a block). */
function blocks(raw: unknown): Record<string, unknown>[] | null {
  if (!Array.isArray(raw)) return null;
  for (const b of raw) {
    if (!isPlainObject(b) || typeof b["type"] !== "string" || b["type"].trim() === "") return null;
  }
  return raw as Record<string, unknown>[];
}

/**
 * Validates a create (mode "create": slug, title and collection are required) or a partial update (mode "update":
 * only the sent keys are checked, and the slug is not part of an update).
 */
export function parseTemplateBody(
  body: Record<string, unknown>,
  mode: "create" | "update",
): TemplateParse {
  const values: TemplateValues = {};
  const has = (k: string) => body[k] !== undefined;

  if (mode === "create") {
    const slug = body["slug"];
    if (typeof slug !== "string" || !SLUG_RE.test(slug)) {
      return {
        ok: false,
        message: "slug is lower-case letters, digits and hyphens, 1 to 100 characters.",
      };
    }
    values.slug = slug;
  }

  if (mode === "create" || has("title")) {
    const title = localizedText(body["title"], TITLE_MAX);
    if (title === null) return { ok: false, message: "title is 1 to 200 characters." };
    values.title = title;
  }

  if (mode === "create" || has("collection")) {
    const c = body["collection"];
    if (typeof c !== "string" || c.trim() === "")
      return { ok: false, message: "collection is a content type slug." };
    values.pageType = c.trim();
  }

  if (has("description")) {
    if (body["description"] === null) {
      values.description = null;
    } else {
      const d = localizedText(body["description"], 1000);
      if (d === null)
        return { ok: false, message: "description is text of up to 1000 characters, or null." };
      values.description = d;
    }
  }

  if (has("initialBlocks") || mode === "create") {
    const list = body["initialBlocks"] ?? [];
    const parsed = blocks(list);
    if (parsed === null)
      return { ok: false, message: "initialBlocks is a list of blocks, each with a type." };
    values.initialBlocks = parsed;
  }

  if (has("allowedRoles")) {
    const r = body["allowedRoles"];
    if (!Array.isArray(r) || !r.every((x) => typeof x === "string")) {
      return { ok: false, message: "allowedRoles is a list of role names." };
    }
    values.allowedRoles = r as string[];
  }

  if (has("requiredPermission")) {
    const p = body["requiredPermission"];
    if (p !== null && typeof p !== "string")
      return { ok: false, message: "requiredPermission is a string, or null." };
    values.requiredPermission = p as string | null;
  }

  if (has("defaultProperties")) {
    if (!isPlainObject(body["defaultProperties"])) {
      return { ok: false, message: "defaultProperties is an object." };
    }
    values.defaultProperties = body["defaultProperties"];
  }

  if (mode === "update" && Object.keys(values).length === 0) {
    return { ok: false, message: "Send at least one field to change." };
  }
  return { ok: true, values };
}

/** The `collection` query filter: a trimmed slug, or null for every template. */
export function templateCollectionFilter(raw: string | undefined): string | null {
  const t = (raw ?? "").trim();
  return t === "" ? null : t;
}

const TEMPLATE_UUID =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * The templateId of a page create body: absent or null means no template (the result is null); otherwise a UUID,
 * lower-cased. Anything else is a 400 message.
 */
export function templateIdField(
  raw: unknown,
): { ok: true; id: string | null } | { ok: false; message: string } {
  if (raw === undefined || raw === null) return { ok: true, id: null };
  if (typeof raw !== "string" || !TEMPLATE_UUID.test(raw)) {
    return { ok: false, message: "templateId is the id of a page template." };
  }
  return { ok: true, id: raw.toLowerCase() };
}

/**
 * Copies a value with a fresh id for every block: any object with a string `type` and a string `id` (a block) gets
 * newId(), at every depth (children included). Everything else is copied as it is. The input is not changed.
 */
export function freshBlockIds(value: unknown, newId: () => string): unknown {
  if (Array.isArray(value)) return value.map((v) => freshBlockIds(v, newId));
  if (value !== null && typeof value === "object") {
    const src = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    // The block gets its new id before its children, so ids are handed out in document order.
    if (typeof src["type"] === "string" && typeof src["id"] === "string") out["id"] = newId();
    for (const [k, v] of Object.entries(src)) if (!(k in out)) out[k] = freshBlockIds(v, newId);
    return out;
  }
  return value;
}

/**
 * The content a new page starts with from a template: its initialBlocks (fresh block ids) and its defaultProperties.
 * Both are copied, so the template row is never shared with the page.
 */
export function templateContent(
  template: { initialBlocks: unknown; defaultProperties: unknown },
  newId: () => string,
): { blocks: unknown[]; properties: Record<string, unknown> } {
  const blocks = Array.isArray(template.initialBlocks)
    ? (freshBlockIds(template.initialBlocks, newId) as unknown[])
    : [];
  const props = template.defaultProperties;
  const properties =
    props !== null && typeof props === "object" && !Array.isArray(props)
      ? (JSON.parse(JSON.stringify(props)) as Record<string, unknown>)
      : {};
  return { blocks, properties };
}
