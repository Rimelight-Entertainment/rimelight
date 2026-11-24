/**
 * Pure helpers for the collections admin routes (CMS.6, decision 0049): body validation for the content_types table.
 * Kept apart from content-collections.ts so the tests load without the database module.
 *
 * Column mapping (packages/cms/src/schema/content_types.ts):
 *   slug -> slug (create only; the slug is the URL), label -> name ({ en: label }), icon -> icon, color -> color,
 *   features -> features, fields -> field_schema ({ groups, fields }).
 *   labelPlural has no column of its own: it is kept in features.labelPlural (UNSURE: the CMS presets use labelPlural
 *   on the collection, but the content_types table has no column for it).
 */

export const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,99}$/;
const LABEL_MAX = 100;
const ICON_MAX = 100;
const DEFAULT_ICON = "i-lucide-box";
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export type FieldSchema = { groups: Record<string, unknown>; fields: Record<string, unknown> };

/** The validated values a route writes. Only the keys present in the body are set. */
export type CollectionValues = {
  slug?: string;
  name?: { en: string };
  icon?: string;
  color?: string | null;
  /** Keys merged into the stored features object (labelPlural included). */
  featuresPatch?: Record<string, unknown>;
  fieldSchema?: FieldSchema;
};

export type CollectionParse =
  | { ok: true; values: CollectionValues }
  | { ok: false; message: string };

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** A trimmed label of 1 to 100 characters, or null. */
function label(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  if (t.length < 1 || Array.from(t).length > LABEL_MAX) return null;
  return t;
}

/**
 * Validates a create (mode "create": slug and label are required, the rest default) or a partial update (mode
 * "update": only the sent keys are checked; the slug is not part of an update). Returns a 400 message on the first
 * problem.
 */
export function parseCollectionBody(
  body: Record<string, unknown>,
  mode: "create" | "update",
): CollectionParse {
  const values: CollectionValues = {};
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

  if (mode === "create" || has("label")) {
    const text = label(body["label"]);
    if (text === null) return { ok: false, message: "label is 1 to 100 characters." };
    values.name = { en: text };
  }

  // labelPlural defaults to the label on create, so a create without it still has a plural form.
  if (has("labelPlural") || mode === "create") {
    const text = has("labelPlural") ? label(body["labelPlural"]) : (values.name?.en ?? null);
    if (text === null) return { ok: false, message: "labelPlural is 1 to 100 characters." };
    values.featuresPatch = { labelPlural: text };
  }

  if (has("icon") || mode === "create") {
    const icon = body["icon"] ?? DEFAULT_ICON;
    if (typeof icon !== "string" || icon.trim() === "" || icon.length > ICON_MAX) {
      return { ok: false, message: "icon is a non-empty string of up to 100 characters." };
    }
    values.icon = icon.trim();
  }

  if (has("color")) {
    const color = body["color"];
    if (color !== null && (typeof color !== "string" || !HEX_COLOR.test(color))) {
      return { ok: false, message: "color is a hex colour such as #3b82f6, or null." };
    }
    values.color = color as string | null;
  }

  if (has("features")) {
    if (!isPlainObject(body["features"])) return { ok: false, message: "features is an object." };
    // The features object is merged over the labelPlural set above, so an explicit labelPlural is not lost.
    values.featuresPatch = { ...body["features"], ...values.featuresPatch };
  }

  if (has("fields")) {
    const f = body["fields"];
    if (!isPlainObject(f) || !isPlainObject(f["fields"])) {
      return { ok: false, message: "fields is an object with a fields map (and optional groups)." };
    }
    const groups = f["groups"] ?? {};
    if (!isPlainObject(groups)) return { ok: false, message: "fields.groups is an object." };
    values.fieldSchema = { groups, fields: f["fields"] };
  } else if (mode === "create") {
    values.fieldSchema = { groups: {}, fields: {} };
  }

  if (mode === "update" && Object.keys(values).length === 0) {
    return { ok: false, message: "Send at least one field to change." };
  }
  return { ok: true, values };
}

/** The message for a DELETE refused because pages of the type exist (409), or null when the delete may go ahead. */
export function collectionInUseMessage(pageCount: number): string | null {
  if (pageCount <= 0) return null;
  return `This collection has ${pageCount} page${pageCount === 1 ? "" : "s"}. Move or delete them first.`;
}

/**
 * A content_types row as the collection routes return it (list and admin routes). `labelPlural` is the stored
 * features.labelPlural, or the English label when none is stored. `routable` is the stored features.routable (a
 * path pattern or a boolean, true by default); `routablePath` is that pattern when it is a string, else null.
 */
export function collectionListItem(r: Record<string, unknown>) {
  const name = r["name"];
  const features = isPlainObject(r["features"]) ? r["features"] : {};
  const storedPlural = features["labelPlural"];
  const englishLabel = isPlainObject(name) && typeof name["en"] === "string" ? name["en"] : null;
  const routable = features["routable"] ?? true;
  return {
    slug: r["slug"],
    name,
    description: r["description"] ?? null,
    icon: r["icon"],
    color: r["color"] ?? null,
    mode: r["mode"],
    features,
    fields: r["field_schema"] ?? { groups: {}, fields: {} },
    labelPlural:
      typeof storedPlural === "string" && storedPlural.trim() !== "" ? storedPlural : englishLabel,
    routable,
    routablePath: typeof routable === "string" ? routable : null,
  };
}
