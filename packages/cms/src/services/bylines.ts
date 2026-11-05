import { and, asc, eq, isNull, or } from "drizzle-orm";
import { isAdmin } from "../auth/roles";
import {
  BYLINE_FIELD_TYPES,
  type BylineFieldDefinition,
  type BylineFieldInput,
  type BylineFieldInputValue,
  type BylineFieldPatch,
  type BylineFieldStored,
  type BylineFieldType,
  type BylineFieldValue,
  type BylineFieldsPatch,
} from "../core/types/bylines";
import { CmsError, notFound, slugify, type CmsActor, type CmsContext } from "./context";

/**
 * Bylines are public author/contributor profiles, decoupled from user accounts (a byline may
 * link to a `userId`, but guest authors and studios work too). Entries reference them in
 * `pages.bylines` as `{ userId: <byline id>, role, customTitle?, displayOrder? }`.
 *
 * Admins define custom fields (`byline_fields`); each byline stores values in `fields`, keyed
 * by field slug. Translatable fields store one value per locale.
 */

export interface BylineInput {
  name: string;
  slug?: string;
  bio?: string | null;
  avatar?: string | null;
  websiteUrl?: string | null;
  userId?: string | null;
  socials?: Record<string, string>;
  metadata?: Record<string, any>;
  isGuest?: boolean;
  fields?: BylineFieldsPatch;
}

export interface BylineRow {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatar: string | null;
  websiteUrl: string | null;
  userId: string | null;
  isGuest: boolean;
  socials: Record<string, string>;
  metadata: Record<string, any>;
  fields: Record<string, BylineFieldStored>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/** Column writes for `updateByline`. Explicit because the `bylines` table is untyped (`<any>`). */
interface BylinePatch {
  updatedAt: Date;
  fields: Record<string, BylineFieldStored>;
  name?: string;
  slug?: string;
  bio?: string | null;
  avatar?: string | null;
  websiteUrl?: string | null;
  userId?: string | null;
  isGuest?: boolean;
  socials?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

const FIELD_SLUG = /^[a-z][a-z0-9_]*$/;

function assertAdmin(actor: CmsActor): void {
  if (!isAdmin(actor)) throw new CmsError(403, "Only admins can manage byline fields");
}

function isBylineFieldType(value: string): value is BylineFieldType {
  return BYLINE_FIELD_TYPES.some((type) => type === value);
}

export async function listBylines(ctx: CmsContext): Promise<BylineRow[]> {
  const b = ctx.t.bylines;
  return ctx.db.select().from(b).where(isNull(b.deletedAt)).orderBy(asc(b.name));
}

export async function getByline(ctx: CmsContext, idOrSlug: string): Promise<BylineRow> {
  const b = ctx.t.bylines;
  const rows = await ctx.db
    .select()
    .from(b)
    .where(and(isNull(b.deletedAt), or(eq(b.slug, idOrSlug), eq(b.id, idOrSlug))))
    .limit(1)
    .catch(() =>
      ctx.db
        .select()
        .from(b)
        .where(and(isNull(b.deletedAt), eq(b.slug, idOrSlug)))
        .limit(1),
    );
  if (!rows[0]) throw notFound("Byline");
  return rows[0];
}

export async function createByline(
  ctx: CmsContext,
  _actor: CmsActor,
  input: BylineInput,
): Promise<BylineRow> {
  if (!input.name?.trim()) throw new CmsError(422, "Name is required");
  const slug = slugify(input.slug || input.name).replace(/\//g, "-");
  const fields = resolveBylineFields(ctx, await listBylineFields(ctx), {}, input.fields);
  const now = new Date();
  const [row] = await ctx.db
    .insert(ctx.t.bylines)
    .values({
      name: input.name,
      slug,
      bio: input.bio ?? null,
      avatar: input.avatar ?? null,
      websiteUrl: input.websiteUrl ?? null,
      userId: input.userId ?? null,
      isGuest: input.isGuest ?? false,
      socials: input.socials ?? {},
      metadata: input.metadata ?? {},
      fields,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return row;
}

export async function updateByline(
  ctx: CmsContext,
  _actor: CmsActor,
  id: string,
  input: Partial<BylineInput>,
): Promise<BylineRow> {
  const b = ctx.t.bylines;
  const [current] = await ctx.db
    .select()
    .from(b)
    .where(and(eq(b.id, id), isNull(b.deletedAt)))
    .limit(1);
  if (!current) throw notFound("Byline");
  if (input.name !== undefined && !input.name.trim()) throw new CmsError(422, "Name is required");

  const patch: BylinePatch = {
    updatedAt: new Date(),
    fields: resolveBylineFields(ctx, await listBylineFields(ctx), current.fields, input.fields),
  };
  if (input.name !== undefined) patch.name = input.name;
  if (input.slug) patch.slug = slugify(input.slug).replace(/\//g, "-");
  if (input.bio !== undefined) patch.bio = input.bio;
  if (input.avatar !== undefined) patch.avatar = input.avatar;
  if (input.websiteUrl !== undefined) patch.websiteUrl = input.websiteUrl;
  if (input.userId !== undefined) patch.userId = input.userId;
  if (input.isGuest !== undefined) patch.isGuest = input.isGuest;
  if (input.socials !== undefined) patch.socials = input.socials;
  if (input.metadata !== undefined) patch.metadata = input.metadata;

  const [row] = await ctx.db.update(b).set(patch).where(eq(b.id, id)).returning();
  if (!row) throw notFound("Byline");
  return row;
}

export async function deleteByline(
  ctx: CmsContext,
  _actor: CmsActor,
  id: string,
): Promise<{ success: true }> {
  await ctx.db
    .update(ctx.t.bylines)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(ctx.t.bylines.id, id));
  return { success: true };
}

// ── Custom byline fields ───────────────────────────────────────────────────

export async function listBylineFields(ctx: CmsContext): Promise<BylineFieldDefinition[]> {
  const f = ctx.t.bylineFields;
  return ctx.db.select().from(f).orderBy(asc(f.sortOrder), asc(f.slug));
}

async function findBylineField(ctx: CmsContext, id: string): Promise<BylineFieldDefinition> {
  const f = ctx.t.bylineFields;
  const [row] = await ctx.db.select().from(f).where(eq(f.id, id)).limit(1);
  if (!row) throw notFound("Byline field");
  return row;
}

/** Bylines (including soft-deleted) whose `fields` object has a key for `slug`. */
async function bylinesWithField(
  ctx: CmsContext,
  slug: string,
): Promise<{ id: string; fields: Record<string, BylineFieldStored> }[]> {
  const b = ctx.t.bylines;
  const rows: { id: string; fields: Record<string, BylineFieldStored> }[] = await ctx.db
    .select({ id: b.id, fields: b.fields })
    .from(b);
  return rows.filter((row) => Object.hasOwn(row.fields, slug));
}

/**
 * Field type and options. `select` needs at least one option; other types take none.
 * Option labels are trimmed and de-duplicated.
 */
function normalizeOptions(type: BylineFieldType, options: string[]): string[] {
  if (type !== "select") {
    if (options.length) throw new CmsError(422, "Only select fields take options");
    return [];
  }
  const cleaned = [...new Set(options.map((option) => option.trim()).filter(Boolean))];
  if (!cleaned.length) throw new CmsError(422, "Select fields need at least one option");
  return cleaned;
}

export async function createBylineField(
  ctx: CmsContext,
  actor: CmsActor,
  input: BylineFieldInput,
): Promise<BylineFieldDefinition> {
  assertAdmin(actor);
  const label = input.label?.trim();
  if (!label) throw new CmsError(422, "Label is required");
  const slug = slugify(input.slug || label).replace(/-/g, "_");
  if (!FIELD_SLUG.test(slug)) {
    throw new CmsError(
      422,
      "Slug must start with a letter and contain only letters, numbers, and underscores",
    );
  }
  if (!isBylineFieldType(input.type)) throw new CmsError(422, "Unknown field type");
  const translatable = input.translatable ?? false;
  if (translatable && input.type === "boolean") {
    throw new CmsError(422, "Boolean fields cannot be translatable");
  }
  const options = normalizeOptions(input.type, input.options ?? []);

  const existing = await listBylineFields(ctx);
  if (existing.some((field) => field.slug === slug)) {
    throw new CmsError(409, `A byline field "${slug}" already exists`);
  }
  const now = new Date();
  const [row] = await ctx.db
    .insert(ctx.t.bylineFields)
    .values({
      slug,
      label,
      type: input.type,
      required: input.required ?? false,
      translatable,
      options,
      sortOrder: existing.reduce((max, field) => Math.max(max, field.sortOrder + 1), 0),
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return row;
}

/**
 * Updates label, required, options, type, and translatable. The slug is immutable. Type and
 * translatable lock once any byline holds a value for the field, so stored values stay valid.
 */
export async function updateBylineField(
  ctx: CmsContext,
  actor: CmsActor,
  id: string,
  patch: BylineFieldPatch,
): Promise<BylineFieldDefinition> {
  assertAdmin(actor);
  const current = await findBylineField(ctx, id);
  const type = patch.type ?? current.type;
  if (!isBylineFieldType(type)) throw new CmsError(422, "Unknown field type");
  const translatable = patch.translatable ?? current.translatable;
  if (translatable && type === "boolean") {
    throw new CmsError(422, "Boolean fields cannot be translatable");
  }
  const label = patch.label === undefined ? current.label : patch.label.trim();
  if (!label) throw new CmsError(422, "Label is required");
  const options = normalizeOptions(
    type,
    patch.options ?? (type === "select" ? current.options : []),
  );

  const changesStorage = type !== current.type || translatable !== current.translatable;
  if (changesStorage && (await bylinesWithField(ctx, current.slug)).length) {
    throw new CmsError(
      409,
      "Type and translatable are locked once a byline has a value for this field",
    );
  }

  const f = ctx.t.bylineFields;
  const [row] = await ctx.db
    .update(f)
    .set({
      label,
      type,
      required: patch.required ?? current.required,
      translatable,
      options,
      updatedAt: new Date(),
    })
    .where(eq(f.id, id))
    .returning();
  if (!row) throw notFound("Byline field");
  return row;
}

/** Deletes the definition and strips its value from every byline. */
export async function deleteBylineField(
  ctx: CmsContext,
  actor: CmsActor,
  id: string,
): Promise<{ success: true }> {
  assertAdmin(actor);
  const current = await findBylineField(ctx, id);
  for (const row of await bylinesWithField(ctx, current.slug)) {
    const fields = { ...row.fields };
    delete fields[current.slug];
    await ctx.db
      .update(ctx.t.bylines)
      .set({ fields, updatedAt: new Date() })
      .where(eq(ctx.t.bylines.id, row.id));
  }
  await ctx.db.delete(ctx.t.bylineFields).where(eq(ctx.t.bylineFields.id, id));
  return { success: true };
}

/** Validates one non-translatable value. `null` or a blank string means "no value". */
function normalizeScalar(
  field: BylineFieldDefinition,
  value: BylineFieldValue | null,
): BylineFieldValue | null {
  if (value === null) return null;
  if (field.type === "boolean") {
    if (typeof value !== "boolean") throw new CmsError(422, `${field.label} must be true or false`);
    return value;
  }
  if (typeof value !== "string") throw new CmsError(422, `${field.label} must be text`);
  const text = value.trim();
  if (!text) return null;
  if (field.type === "url") {
    let protocol = "";
    try {
      protocol = new URL(text).protocol;
    } catch {
      // Not a parseable URL; reported below.
    }
    if (protocol !== "http:" && protocol !== "https:") {
      throw new CmsError(422, `${field.label} must be an http or https URL`);
    }
  }
  if (field.type === "select" && !field.options.includes(text)) {
    throw new CmsError(422, `${field.label} must be one of its options`);
  }
  return text;
}

/** Validates one incoming value. Translatable fields take a `{ [locale]: value }` map. */
function normalizeFieldValue(
  ctx: CmsContext,
  field: BylineFieldDefinition,
  value: BylineFieldInputValue,
): BylineFieldStored | null {
  if (value === null) return null;
  if (typeof value !== "object") {
    if (field.translatable) {
      throw new CmsError(422, `${field.label} is translatable: send a value per locale`);
    }
    return normalizeScalar(field, value);
  }
  if (!field.translatable) {
    throw new CmsError(422, `${field.label} is not translatable: send a single value`);
  }
  const perLocale: Record<string, BylineFieldValue> = {};
  for (const [locale, localeValue] of Object.entries(value)) {
    if (!ctx.locales.includes(locale)) throw new CmsError(422, `Unknown locale "${locale}"`);
    const normalized = normalizeScalar(field, localeValue);
    if (normalized !== null) perLocale[locale] = normalized;
  }
  return Object.keys(perLocale).length ? perLocale : null;
}

/**
 * Applies a `fields` patch on top of the stored values (a `null` entry removes that value),
 * then checks required fields. Required translatable fields need the default locale.
 */
function resolveBylineFields(
  ctx: CmsContext,
  defs: BylineFieldDefinition[],
  current: Record<string, BylineFieldStored>,
  patch: BylineFieldsPatch | undefined,
): Record<string, BylineFieldStored> {
  const next: Record<string, BylineFieldStored> = { ...current };
  for (const [slug, value] of Object.entries(patch ?? {})) {
    const field = defs.find((def) => def.slug === slug);
    if (!field) throw new CmsError(422, `Unknown byline field "${slug}"`);
    const normalized = normalizeFieldValue(ctx, field, value);
    if (normalized === null) delete next[slug];
    else next[slug] = normalized;
  }
  const defaultLocale = ctx.locales[0] ?? "en";
  for (const field of defs) {
    if (!field.required) continue;
    const value = next[field.slug];
    const present = field.translatable
      ? typeof value === "object" && defaultLocale in value
      : value !== undefined;
    if (!present) throw new CmsError(422, `${field.label} is required`);
  }
  return next;
}
