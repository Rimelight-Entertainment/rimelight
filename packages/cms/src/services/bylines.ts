import { and, asc, eq, isNull, or } from "drizzle-orm";
import { CmsError, notFound, slugify, type CmsActor, type CmsContext } from "./context";

/**
 * Bylines are public author/contributor profiles, decoupled from user accounts (a byline may
 * link to a `userId`, but guest authors and studios work too). Entries reference them in
 * `pages.bylines` as `{ userId: <byline id>, role, customTitle?, displayOrder? }`.
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
}

export async function listBylines(ctx: CmsContext) {
  const b = ctx.t.bylines;
  return ctx.db.select().from(b).where(isNull(b.deletedAt)).orderBy(asc(b.name));
}

export async function getByline(ctx: CmsContext, idOrSlug: string) {
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

export async function createByline(ctx: CmsContext, _actor: CmsActor, input: BylineInput) {
  if (!input.name?.trim()) throw new CmsError(422, "Name is required");
  const slug = slugify(input.slug || input.name).replace(/\//g, "-");
  const now = new Date();
  const [row] = await ctx.db
    .insert(ctx.t.bylines)
    .values({
      ...input,
      slug,
      socials: input.socials ?? {},
      metadata: input.metadata ?? {},
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
) {
  const patch: Record<string, any> = { ...input, updatedAt: new Date() };
  if (input.slug !== undefined) patch["slug"] = slugify(input.slug).replace(/\//g, "-");
  const [row] = await ctx.db
    .update(ctx.t.bylines)
    .set(patch)
    .where(and(eq(ctx.t.bylines.id, id), isNull(ctx.t.bylines.deletedAt)))
    .returning();
  if (!row) throw notFound("Byline");
  return row;
}

export async function deleteByline(ctx: CmsContext, _actor: CmsActor, id: string) {
  await ctx.db
    .update(ctx.t.bylines)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(ctx.t.bylines.id, id));
  return { success: true };
}
