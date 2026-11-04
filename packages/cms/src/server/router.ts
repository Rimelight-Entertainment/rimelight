import { Hono, type Context } from "hono";
import { CmsError, type CmsActor } from "../services/context";
import type { Cms } from "../services/index";
import { cmsForRequest, requireActor, type CmsServerOptions } from "./context";
import { handleCmsMcpRequest } from "../mcp/index";
import { registerCmsMediaRoutes } from "./media";
import { createContentRouter } from "./content";
import { handleCmsError } from "./errors";

export interface CmsRouterOptions extends CmsServerOptions {}

type Handler = (args: {
  cms: Cms;
  actor: CmsActor;
  c: Context;
  body: any;
}) => Promise<unknown> | Record<string, any> | any[] | string | number | boolean | null;

/**
 * Admin REST API. Every route is authenticated and delegates to the service layer, so the
 * router contains no data logic — validation, permissions and workflow rules live in services.
 */
export function createCmsRouter(options: CmsRouterOptions = {}): Hono {
  const app = new Hono();

  app.onError(handleCmsError as any);

  const route =
    (fn: Handler, status: 200 | 201 = 200) =>
    async (c: Context) => {
      const actor = await requireActor(c, options);
      const cms = cmsForRequest(c, options);
      const method = c.req.method;
      const body =
        method === "POST" || method === "PUT" || method === "PATCH"
          ? await c.req.json().catch(() => ({}))
          : {};
      const result = await fn({ cms, actor, c, body });
      return c.json((result ?? { success: true }) as any, status);
    };

  const q = (c: Context, key: string) => c.req.query(key) || undefined;
  const p = (c: Context, key: string) => c.req.param(key)!;

  // ── Session ────────────────────────────────────────────────────────────────
  app.get(
    "/me",
    route(({ actor }) => ({ user: actor })),
  );
  app.get(
    "/stats",
    route(({ cms }) => cms.stats()),
  );

  // ── Collections (schemas) ──────────────────────────────────────────────────
  app.get(
    "/collections",
    route(async ({ cms }) => ({ collections: await cms.collections.listCollections() })),
  );
  app.post(
    "/collections",
    route(
      async ({ cms, actor, body }) => ({
        collection: await cms.collections.createCollection(actor, body),
      }),
      201,
    ),
  );
  app.get(
    "/collection-presets",
    route(({ cms }) => ({ presets: cms.collections.listCollectionPresets() })),
  );
  app.post(
    "/collections/from-preset",
    route(
      async ({ cms, actor, body }) => ({
        collection: await cms.collections.createCollectionFromPreset(
          actor,
          body?.preset,
          body?.overrides ?? {},
        ),
      }),
      201,
    ),
  );
  app.get(
    "/collections/:slug",
    route(async ({ cms, c }) => ({
      collection: await cms.collections.getCollection(p(c, "slug")),
    })),
  );
  app.put(
    "/collections/:slug",
    route(async ({ cms, actor, c, body }) => ({
      collection: await cms.collections.updateCollection(actor, p(c, "slug"), body),
    })),
  );
  app.delete(
    "/collections/:slug",
    route(({ cms, actor, c }) => cms.collections.deleteCollection(actor, p(c, "slug"))),
  );

  // ── Entries ────────────────────────────────────────────────────────────────
  app.get(
    "/entries",
    route(({ cms, c }) => {
      const status = q(c, "status");
      const taxonomy = q(c, "taxonomy");
      const term = q(c, "term");
      return cms.entries.listEntries({
        ...(q(c, "collection") ? { collection: q(c, "collection")! } : {}),
        ...(status ? { status: status.split(",") as any } : {}),
        ...(q(c, "q") ? { q: q(c, "q")! } : {}),
        ...(q(c, "slugPrefix") ? { slugPrefix: q(c, "slugPrefix")! } : {}),
        ...(taxonomy && term ? { taxonomy: { taxonomy, term } } : {}),
        ...(q(c, "orderBy") ? { orderBy: q(c, "orderBy") as any } : {}),
        includeDeleted: q(c, "deleted") === "true",
        includeContent: q(c, "content") === "true",
        limit: Number(q(c, "limit") ?? 50),
        offset: Number(q(c, "offset") ?? 0),
      });
    }),
  );
  app.post(
    "/entries",
    route(
      async ({ cms, actor, body }) => ({ entry: await cms.entries.createEntry(actor, body) }),
      201,
    ),
  );
  app.get(
    "/entries/:id",
    route(async ({ cms, actor, c }) => {
      const entry = await cms.entries.getEntry(p(c, "id"));
      return { entry, lock: await cms.entries.getLock(actor, entry.id) };
    }),
  );
  app.patch(
    "/entries/:id",
    route(async ({ cms, actor, c, body }) => ({
      entry: await cms.entries.updateEntryMeta(actor, p(c, "id"), body),
    })),
  );
  app.delete(
    "/entries/:id",
    route(({ cms, actor, c }) => cms.entries.deleteEntry(actor, p(c, "id"))),
  );
  app.post(
    "/entries/:id/restore",
    route(async ({ cms, actor, c }) => ({
      entry: await cms.entries.restoreEntry(actor, p(c, "id")),
    })),
  );
  app.post(
    "/entries/:id/duplicate",
    route(
      async ({ cms, actor, c }) => ({ entry: await cms.entries.duplicateEntry(actor, p(c, "id")) }),
      201,
    ),
  );

  app.put(
    "/entries/:id/draft",
    route(async ({ cms, actor, c, body }) => ({
      entry: await cms.entries.saveDraft(actor, p(c, "id"), body),
    })),
  );
  app.delete(
    "/entries/:id/draft",
    route(async ({ cms, actor, c }) => ({
      entry: await cms.entries.discardDraft(actor, p(c, "id")),
    })),
  );

  app.get(
    "/entries/:id/lock",
    route(async ({ cms, actor, c }) => ({ lock: await cms.entries.getLock(actor, p(c, "id")) })),
  );
  app.post(
    "/entries/:id/lock",
    route(async ({ cms, actor, c, body }) => ({
      lock: await cms.entries.acquireLock(actor, p(c, "id"), { force: !!body.force }),
    })),
  );
  app.delete(
    "/entries/:id/lock",
    route(({ cms, actor, c }) => cms.entries.releaseLock(actor, p(c, "id"))),
  );

  app.post(
    "/entries/:id/review",
    route(
      async ({ cms, actor, c, body }) => ({
        version: await cms.entries.requestReview(actor, p(c, "id"), body.changeSummary),
      }),
      201,
    ),
  );
  app.post(
    "/entries/:id/publish",
    route(async ({ cms, actor, c, body }) => ({
      entry: await cms.entries.publishEntry(actor, p(c, "id"), body),
    })),
  );
  app.post(
    "/entries/:id/unpublish",
    route(async ({ cms, actor, c }) => ({
      entry: await cms.entries.unpublishEntry(actor, p(c, "id")),
    })),
  );
  app.post(
    "/entries/:id/schedule",
    route(async ({ cms, actor, c, body }) => ({
      entry: await cms.entries.scheduleEntry(actor, p(c, "id"), body.at ?? null),
    })),
  );
  app.get(
    "/entries/:id/versions",
    route(async ({ cms, c }) => ({ versions: await cms.entries.listVersions(p(c, "id")) })),
  );
  app.get(
    "/entries/:id/diff",
    route(async ({ cms, c }) => ({
      diff: await cms.entries.diffEntry(p(c, "id"), q(c, "from"), q(c, "to")),
    })),
  );
  app.post(
    "/entries/:id/preview-token",
    route(({ cms, c }) => cms.entries.createPreviewToken(p(c, "id"))),
  );
  app.get(
    "/entries/:id/terms",
    route(async ({ cms, c }) => ({
      terms: await cms.taxonomies.getEntryTerms(p(c, "id"), q(c, "taxonomy")),
    })),
  );
  app.put(
    "/entries/:id/terms/:taxonomy",
    route(async ({ cms, actor, c, body }) => ({
      terms: await cms.taxonomies.setEntryTerms(
        actor,
        p(c, "id"),
        p(c, "taxonomy"),
        body.termIds ?? [],
      ),
    })),
  );

  // ── Versions & review ──────────────────────────────────────────────────────
  app.get(
    "/reviews",
    route(async ({ cms }) => ({ versions: await cms.entries.reviewQueue() })),
  );
  app.get(
    "/versions",
    route(async ({ cms }) => ({ versions: await cms.entries.listVersions(undefined, 100) })),
  );
  app.get(
    "/versions/:id",
    route(async ({ cms, c }) => ({ version: await cms.entries.getVersion(p(c, "id")) })),
  );
  app.post(
    "/versions/:id/approve",
    route(async ({ cms, actor, c }) => ({
      version: await cms.entries.approveVersion(actor, p(c, "id")),
    })),
  );
  app.post(
    "/versions/:id/reject",
    route(async ({ cms, actor, c, body }) => ({
      version: await cms.entries.rejectVersion(actor, p(c, "id"), body.reason),
    })),
  );
  app.post(
    "/versions/:id/rollback",
    route(async ({ cms, actor, c }) => ({
      entry: await cms.entries.rollbackToVersion(actor, p(c, "id")),
    })),
  );
  app.get(
    "/versions/:id/comments",
    route(async ({ cms, c }) => ({ comments: await cms.entries.listComments(p(c, "id")) })),
  );
  app.post(
    "/versions/:id/comments",
    route(
      async ({ cms, actor, c, body }) => ({
        comment: await cms.entries.addComment(actor, p(c, "id"), body.content ?? "", body.blockId),
      }),
      201,
    ),
  );

  // ── Templates ──────────────────────────────────────────────────────────────
  app.get(
    "/templates",
    route(async ({ cms, actor, c }) => ({
      templates: await cms.templates.listTemplates(actor, q(c, "collection")),
    })),
  );
  app.post(
    "/templates",
    route(
      async ({ cms, actor, body }) => ({
        template: await cms.templates.createTemplate(actor, body),
      }),
      201,
    ),
  );
  app.get(
    "/templates/:id",
    route(async ({ cms, c }) => ({ template: await cms.templates.getTemplate(p(c, "id")) })),
  );
  app.put(
    "/templates/:id",
    route(async ({ cms, actor, c, body }) => ({
      template: await cms.templates.updateTemplate(actor, p(c, "id"), body),
    })),
  );
  app.delete(
    "/templates/:id",
    route(({ cms, actor, c }) => cms.templates.deleteTemplate(actor, p(c, "id"))),
  );

  // ── Taxonomies ─────────────────────────────────────────────────────────────
  app.get(
    "/taxonomies",
    route(async ({ cms }) => ({ taxonomies: await cms.taxonomies.listTaxonomies() })),
  );
  app.get(
    "/taxonomy-presets",
    route(({ cms }) => ({ presets: cms.taxonomies.listTaxonomyPresets() })),
  );
  app.post(
    "/taxonomies",
    route(
      async ({ cms, actor, body }) => ({
        taxonomy: await cms.taxonomies.createTaxonomy(actor, body),
      }),
      201,
    ),
  );
  app.post(
    "/taxonomies/from-preset",
    route(
      async ({ cms, actor, body }) => ({
        taxonomy: await cms.taxonomies.createTaxonomyFromPreset(
          actor,
          body?.preset,
          body?.overrides ?? {},
        ),
      }),
      201,
    ),
  );
  app.get(
    "/taxonomies/:taxonomy",
    route(async ({ cms, c }) => ({ taxonomy: await cms.taxonomies.getTaxonomy(p(c, "taxonomy")) })),
  );
  app.put(
    "/taxonomies/:taxonomy",
    route(async ({ cms, actor, c, body }) => ({
      taxonomy: await cms.taxonomies.updateTaxonomy(actor, p(c, "taxonomy"), body),
    })),
  );
  app.delete(
    "/taxonomies/:taxonomy",
    route(({ cms, actor, c }) => cms.taxonomies.deleteTaxonomy(actor, p(c, "taxonomy"))),
  );
  app.get(
    "/taxonomies/:taxonomy/terms",
    route(async ({ cms, c }) => ({ terms: await cms.taxonomies.listTerms(p(c, "taxonomy")) })),
  );
  app.post(
    "/taxonomies/:taxonomy/terms",
    route(
      async ({ cms, actor, c, body }) => ({
        term: await cms.taxonomies.createTerm(actor, p(c, "taxonomy"), body),
      }),
      201,
    ),
  );
  app.put(
    "/taxonomies/:taxonomy/terms/:id",
    route(async ({ cms, actor, c, body }) => ({
      term: await cms.taxonomies.updateTerm(actor, p(c, "id"), body),
    })),
  );
  app.delete(
    "/taxonomies/:taxonomy/terms/:id",
    route(({ cms, actor, c }) => cms.taxonomies.deleteTerm(actor, p(c, "id"))),
  );

  // ── Bylines ────────────────────────────────────────────────────────────────
  app.get(
    "/bylines",
    route(async ({ cms }) => ({ bylines: await cms.bylines.listBylines() })),
  );
  app.post(
    "/bylines",
    route(
      async ({ cms, actor, body }) => ({ byline: await cms.bylines.createByline(actor, body) }),
      201,
    ),
  );
  app.get(
    "/bylines/:id",
    route(async ({ cms, c }) => ({ byline: await cms.bylines.getByline(p(c, "id")) })),
  );
  app.put(
    "/bylines/:id",
    route(async ({ cms, actor, c, body }) => ({
      byline: await cms.bylines.updateByline(actor, p(c, "id"), body),
    })),
  );
  app.delete(
    "/bylines/:id",
    route(({ cms, actor, c }) => cms.bylines.deleteByline(actor, p(c, "id"))),
  );

  // ── Settings, search ───────────────────────────────────────────────────────
  app.get(
    "/settings",
    route(async ({ cms }) => ({ settings: await cms.settings.getSiteSettings() })),
  );
  app.put(
    "/settings",
    route(async ({ cms, actor, body }) => {
      if (
        !actor.roles.some((r) => ["owner", "admin"].includes(r)) &&
        !actor.permissions.includes("*")
      ) {
        throw new CmsError(403, "Only admins can change site settings");
      }
      return { settings: await cms.settings.updateSiteSettings(body) };
    }),
  );
  app.get(
    "/search",
    route(async ({ cms, c }) => ({
      results: await cms.search.searchEntries(q(c, "q") ?? "", {
        ...(q(c, "collection") ? { collection: q(c, "collection")! } : {}),
        limit: Number(q(c, "limit") ?? 20),
      }),
    })),
  );
  app.post(
    "/search/reindex",
    route(({ cms }) => cms.search.reindexAll()),
  );

  // ── Media ──────────────────────────────────────────────────────────────────
  registerCmsMediaRoutes(app, "/media", {
    getCms: (c: any) => cmsForRequest(c, options),
    ...(options.config?.storage ? { storage: options.config.storage } : {}),
    fileBasePath: `${(options.apiPath ?? "/api/cms").replace(/\/$/, "")}/media/file`,
    getSession: async (req) => {
      // Media handlers are framework-agnostic; reuse the CMS auth via a minimal context.
      const fake = { req: { raw: req }, get: () => undefined, env: undefined };
      return requireActor(fake, options).catch(() => null);
    },
  });

  // Mention titles in the editor's locale (same resolution as delivery).
  app.get(
    "/mentions",
    route(async ({ cms, c }) => {
      const ids = (q(c, "ids") ?? "").split(",").filter(Boolean).slice(0, 200);
      return { titles: await cms.mentions.mentionTitles(ids, q(c, "locale") ?? "en") };
    }),
  );

  // ── MCP (JSON-RPC over HTTP) ───────────────────────────────────────────────
  app.post("/mcp", async (c) => {
    const actor = await requireActor(c, options);
    const cms = cmsForRequest(c, options);
    const body = (await c.req.json().catch(() => null)) as any;
    return c.json(await handleCmsMcpRequest(body, cms, actor));
  });

  return app;
}

/**
 * Full CMS HTTP surface: admin API under `/cms`, public delivery under `/content` and `/search`.
 * Mounted by the `cms()` middleware; usable directly with `app.route("/api", createCmsApi())`.
 */
export function createCmsApi(options: CmsRouterOptions = {}): Hono {
  const app = new Hono();
  app.route("/cms", createCmsRouter(options));
  const content = createContentRouter(options);
  app.route("/content", content.content);
  app.route("/search", content.search);
  return app;
}

export type CmsRouterType = ReturnType<typeof createCmsRouter>;
