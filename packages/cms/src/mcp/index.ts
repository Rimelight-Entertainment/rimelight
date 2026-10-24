import type { Cms } from "../services/index";
import { CmsError, type CmsActor } from "../services/context";

/**
 * Model Context Protocol tools. Each tool is a thin adapter over the service layer, so agents
 * get exactly the same validation, permissions and workflow rules as the dashboard.
 */

type JsonSchema = { type: "object"; properties: Record<string, any>; required?: string[] };

interface ToolDef {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  run: (cms: Cms, actor: CmsActor, args: any) => Promise<unknown> | unknown;
}

const str = (description: string) => ({ type: "string", description });
const num = (description: string) => ({ type: "number", description });
const obj = (description: string) => ({ type: "object", description });
const arr = (description: string, items: any = { type: "object" }) => ({ type: "array", description, items });
const schema = (properties: Record<string, any>, required: string[] = []): JsonSchema => ({
  type: "object",
  properties,
  ...(required.length ? { required } : {}),
});

const BLOCKS_HINT =
  "Block tree: [{ id: uuid, type, props, children? }]. Call cms_list_block_types for valid types and props.";

const tools: ToolDef[] = [
  // ── Schema discovery ─────────────────────────────────────────────────────
  {
    name: "cms_list_collections",
    description: "List content collections (schemas) with their fields, features and workflow.",
    inputSchema: schema({}),
    run: (cms) => cms.collections.listCollections(),
  },
  {
    name: "cms_list_block_types",
    description: "List block types usable in entry content, with default props, fields and allowed children.",
    inputSchema: schema({}),
    run: (cms) =>
      cms.ctx.blocks.all().map(({ render: _r, editor: _e, initialChildren: _i, ...d }) => d),
  },
  // ── Entries ──────────────────────────────────────────────────────────────
  {
    name: "cms_list_entries",
    description: "List entries. Filter by collection (`type`), status, text query or slug prefix.",
    inputSchema: schema({
      collection: str("Collection slug, e.g. 'blog', 'doc', 'wiki'"),
      status: str("draft | scheduled | published | archived (comma-separated)"),
      q: str("Matches title or slug"),
      slugPrefix: str("Only slugs starting with this (doc/wiki trees)"),
      limit: num("Default 20"),
      offset: num("Default 0"),
    }),
    run: (cms, _a, x) =>
      cms.entries.listEntries({
        ...(x.collection ? { collection: x.collection } : {}),
        ...(x.status ? { status: String(x.status).split(",") as any } : {}),
        ...(x.q ? { q: x.q } : {}),
        ...(x.slugPrefix ? { slugPrefix: x.slugPrefix } : {}),
        limit: x.limit ?? 20,
        offset: x.offset ?? 0,
      }),
  },
  {
    name: "cms_get_entry",
    description: "Get an entry (published + draft content, metadata) by slug or id.",
    inputSchema: schema({ idOrSlug: str("Entry slug or UUID") }, ["idOrSlug"]),
    run: (cms, _a, x) => cms.entries.getEntry(x.idOrSlug),
  },
  {
    name: "cms_create_entry",
    description: `Create a draft entry. ${BLOCKS_HINT}`,
    inputSchema: schema(
      {
        collection: str("Collection slug"),
        slug: str("URL slug (derived from title if omitted)"),
        title: obj("Localized title, e.g. { en: 'Title' }"),
        description: obj("Localized description"),
        templateId: str("Template id or slug to start from"),
        blocks: arr("Initial block tree"),
        properties: obj("Field values for the collection"),
        tags: arr("Localized tags"),
        bylines: arr("[{ userId: bylineId, role }]"),
      },
      ["collection", "title"],
    ),
    run: (cms, a, x) => cms.entries.createEntry(a, x),
  },
  {
    name: "cms_update_entry",
    description: "Update entry metadata (title, slug, description, tags, bylines). Use cms_create_draft for content.",
    inputSchema: schema(
      { id: str("Entry id"), slug: str(""), title: obj(""), description: obj(""), tags: arr(""), bylines: arr(""), collection: str("Move to another collection") },
      ["id"],
    ),
    run: async (cms, a, { id, blocks, properties, ...meta }) => {
      const entry = await cms.entries.updateEntryMeta(a, id, meta);
      return blocks || properties ? cms.entries.saveDraft(a, id, { blocks, properties }) : entry;
    },
  },
  {
    name: "cms_save_draft",
    description: `Save the working copy (not visible to readers until published). ${BLOCKS_HINT}`,
    inputSchema: schema({ entryId: str("Entry id"), blocks: arr("Full block tree"), properties: obj("Field values") }, ["entryId"]),
    run: (cms, a, x) => cms.entries.saveDraft(a, x.entryId, { blocks: x.blocks, properties: x.properties }),
  },
  {
    name: "cms_request_review",
    description: "Freeze the draft as a pending version for reviewers (required when the collection needs approvals).",
    inputSchema: schema({ entryId: str("Entry id"), changeSummary: str("What changed") }, ["entryId"]),
    run: (cms, a, x) => cms.entries.requestReview(a, x.entryId, x.changeSummary),
  },
  {
    name: "cms_publish_entry",
    description: "Publish the draft (or an approved version) and create an immutable version.",
    inputSchema: schema({ entryId: str("Entry id"), versionId: str("Approved version to publish"), changeSummary: str("") }, ["entryId"]),
    run: (cms, a, x) => cms.entries.publishEntry(a, x.entryId, { versionId: x.versionId, changeSummary: x.changeSummary }),
  },
  {
    name: "cms_schedule_entry",
    description: "Schedule the draft to publish at an ISO date-time. Pass at=null to cancel.",
    inputSchema: schema({ entryId: str("Entry id"), at: str("ISO 8601 date-time or null") }, ["entryId"]),
    run: (cms, a, x) => cms.entries.scheduleEntry(a, x.entryId, x.at ?? null),
  },
  {
    name: "cms_unpublish_entry",
    description: "Take an entry offline (content is kept as the draft).",
    inputSchema: schema({ entryId: str("Entry id") }, ["entryId"]),
    run: (cms, a, x) => cms.entries.unpublishEntry(a, x.entryId),
  },
  {
    name: "cms_delete_entry",
    description: "Move an entry to the trash (soft delete; restorable).",
    inputSchema: schema({ entryId: str("Entry id") }, ["entryId"]),
    run: (cms, a, x) => cms.entries.deleteEntry(a, x.entryId),
  },
  // ── Versions & review ────────────────────────────────────────────────────
  {
    name: "cms_list_versions",
    description: "List version history of an entry.",
    inputSchema: schema({ entryId: str("Entry id"), limit: num("Default 50") }, ["entryId"]),
    run: (cms, _a, x) => cms.entries.listVersions(x.entryId, x.limit ?? 50),
  },
  {
    name: "cms_get_version",
    description: "Get a version snapshot including content.",
    inputSchema: schema({ versionId: str("Version id") }, ["versionId"]),
    run: (cms, _a, x) => cms.entries.getVersion(x.versionId),
  },
  {
    name: "cms_rollback_version",
    description: "Restore a version's content into the draft (publish separately).",
    inputSchema: schema({ versionId: str("Version id") }, ["versionId"]),
    run: (cms, a, x) => cms.entries.rollbackToVersion(a, x.versionId),
  },
  {
    name: "cms_approve_version",
    description: "Approve a pending version as the calling user.",
    inputSchema: schema({ versionId: str("Version id") }, ["versionId"]),
    run: (cms, a, x) => cms.entries.approveVersion(a, x.versionId),
  },
  {
    name: "cms_reject_version",
    description: "Reject a pending version with an optional reason.",
    inputSchema: schema({ versionId: str("Version id"), reason: str("") }, ["versionId"]),
    run: (cms, a, x) => cms.entries.rejectVersion(a, x.versionId, x.reason),
  },
  {
    name: "cms_add_comment",
    description: "Comment on a version, optionally anchored to a block.",
    inputSchema: schema({ versionId: str(""), content: str(""), blockId: str("") }, ["versionId", "content"]),
    run: (cms, a, x) => cms.entries.addComment(a, x.versionId, x.content, x.blockId),
  },
  {
    name: "cms_review_queue",
    description: "List versions awaiting review.",
    inputSchema: schema({}),
    run: (cms) => cms.entries.reviewQueue(),
  },
  // ── Templates ────────────────────────────────────────────────────────────
  {
    name: "cms_list_templates",
    description: "List entry templates, optionally for one collection.",
    inputSchema: schema({ collection: str("Collection slug") }),
    run: (cms, a, x) => cms.templates.listTemplates(a, x.collection),
  },
  {
    name: "cms_get_template",
    description: "Get a template by id or slug.",
    inputSchema: schema({ idOrSlug: str("") }, ["idOrSlug"]),
    run: (cms, _a, x) => cms.templates.getTemplate(x.idOrSlug),
  },
  {
    name: "cms_create_template",
    description: `Create a template (admins). ${BLOCKS_HINT}`,
    inputSchema: schema(
      { slug: str(""), title: obj(""), description: obj(""), collection: str("Collection slug"), rolePermissions: obj(""), approvalRules: obj(""), defaultProperties: obj(""), initialBlocks: arr("") },
      ["title", "collection"],
    ),
    run: (cms, a, x) => cms.templates.createTemplate(a, x),
  },
  {
    name: "cms_update_template",
    description: "Update a template (admins).",
    inputSchema: schema({ id: str(""), slug: str(""), title: obj(""), description: obj(""), collection: str(""), rolePermissions: obj(""), approvalRules: obj(""), defaultProperties: obj(""), initialBlocks: arr("") }, ["id"]),
    run: (cms, a, { id, ...x }) => cms.templates.updateTemplate(a, id, x),
  },
  {
    name: "cms_delete_template",
    description: "Delete a template (admins).",
    inputSchema: schema({ id: str("") }, ["id"]),
    run: (cms, a, x) => cms.templates.deleteTemplate(a, x.id),
  },
  // ── Collections ──────────────────────────────────────────────────────────
  {
    name: "cms_get_collection",
    description: "Get one collection definition.",
    inputSchema: schema({ idOrSlug: str("Collection slug") }, ["idOrSlug"]),
    run: (cms, _a, x) => cms.collections.getCollection(x.idOrSlug),
  },
  {
    name: "cms_create_collection",
    description: "Create a collection (admins). fields: { key: { type, label, required?, options?, group? } }.",
    inputSchema: schema({ slug: str(""), label: obj(""), description: obj(""), icon: str(""), kind: str("document | data | singleton"), fields: obj(""), groups: obj(""), features: obj(""), workflow: obj("") }, ["slug", "label"]),
    run: (cms, a, x) => cms.collections.createCollection(a, x),
  },
  {
    name: "cms_update_collection",
    description: "Update or override a collection (admins).",
    inputSchema: schema({ slug: str(""), label: obj(""), description: obj(""), icon: str(""), fields: obj(""), groups: obj(""), features: obj(""), workflow: obj("") }, ["slug"]),
    run: (cms, a, { slug, ...x }) => cms.collections.updateCollection(a, slug, x),
  },
  {
    name: "cms_delete_collection",
    description: "Delete a database collection (entries are kept).",
    inputSchema: schema({ slug: str("") }, ["slug"]),
    run: (cms, a, x) => cms.collections.deleteCollection(a, x.slug),
  },
  // ── Taxonomies ───────────────────────────────────────────────────────────
  {
    name: "cms_list_terms",
    description: "List terms of a taxonomy with published entry counts.",
    inputSchema: schema({ taxonomy: str("category | tag | custom") }, ["taxonomy"]),
    run: (cms, _a, x) => cms.taxonomies.listTerms(x.taxonomy),
  },
  {
    name: "cms_create_term",
    description: "Create a term.",
    inputSchema: schema({ taxonomy: str(""), slug: str(""), label: obj(""), description: obj(""), parentId: str(""), displayOrder: num("") }, ["taxonomy", "label"]),
    run: (cms, a, { taxonomy, ...x }) => cms.taxonomies.createTerm(a, taxonomy, x),
  },
  {
    name: "cms_update_term",
    description: "Update a term.",
    inputSchema: schema({ id: str(""), slug: str(""), label: obj(""), description: obj(""), parentId: str(""), displayOrder: num("") }, ["id"]),
    run: (cms, a, { id, ...x }) => cms.taxonomies.updateTerm(a, id, x),
  },
  {
    name: "cms_delete_term",
    description: "Delete a term.",
    inputSchema: schema({ id: str("") }, ["id"]),
    run: (cms, a, x) => cms.taxonomies.deleteTerm(a, x.id),
  },
  {
    name: "cms_set_entry_terms",
    description: "Set an entry's terms within one taxonomy.",
    inputSchema: schema({ entryId: str(""), taxonomy: str("Default 'category'"), termIds: arr("", { type: "string" }) }, ["entryId", "termIds"]),
    run: (cms, a, x) => cms.taxonomies.setEntryTerms(a, x.entryId, x.taxonomy ?? "category", x.termIds),
  },
  // ── Bylines ──────────────────────────────────────────────────────────────
  { name: "cms_list_bylines", description: "List bylines.", inputSchema: schema({}), run: (cms) => cms.bylines.listBylines() },
  {
    name: "cms_get_byline",
    description: "Get a byline by id or slug.",
    inputSchema: schema({ idOrSlug: str("") }, ["idOrSlug"]),
    run: (cms, _a, x) => cms.bylines.getByline(x.idOrSlug),
  },
  {
    name: "cms_create_byline",
    description: "Create an author/contributor byline.",
    inputSchema: schema({ name: str(""), slug: str(""), bio: str(""), avatar: str(""), websiteUrl: str(""), userId: str(""), socials: obj(""), metadata: obj("") }, ["name"]),
    run: (cms, a, x) => cms.bylines.createByline(a, x),
  },
  {
    name: "cms_update_byline",
    description: "Update a byline.",
    inputSchema: schema({ id: str(""), name: str(""), slug: str(""), bio: str(""), avatar: str(""), websiteUrl: str(""), userId: str(""), socials: obj(""), metadata: obj("") }, ["id"]),
    run: (cms, a, { id, ...x }) => cms.bylines.updateByline(a, id, x),
  },
  {
    name: "cms_delete_byline",
    description: "Delete a byline.",
    inputSchema: schema({ id: str("") }, ["id"]),
    run: (cms, a, x) => cms.bylines.deleteByline(a, x.id),
  },
  // ── Settings & search ────────────────────────────────────────────────────
  { name: "cms_get_site_settings", description: "Get site settings.", inputSchema: schema({}), run: (cms) => cms.settings.getSiteSettings() },
  {
    name: "cms_update_site_settings",
    description: "Update site settings (admins).",
    inputSchema: schema({ name: str(""), description: str(""), url: str(""), author: str(""), email: str(""), ogImage: str(""), branding: obj(""), seo: obj("") }),
    run: (cms, a, x) => {
      if (!a.permissions.includes("*") && !a.roles.some((r) => ["owner", "admin"].includes(r))) {
        throw new CmsError(403, "Only admins can change site settings");
      }
      return cms.settings.updateSiteSettings(x);
    },
  },
  {
    name: "cms_search",
    description: "Full-text search over published entries.",
    inputSchema: schema({ query: str(""), collection: str("Collection slug"), limit: num("Default 10") }, ["query"]),
    run: (cms, _a, x) => cms.search.searchEntries(x.query, { ...(x.collection ? { collection: x.collection } : {}), limit: x.limit ?? 10 }),
  },
];

/** Public tool metadata (what `tools/list` returns). */
export const CMS_MCP_TOOLS = tools.map(({ run: _run, ...t }) => t);

const SERVER_INFO = { name: "rimelight-cms", version: "1.0.0" };

/**
 * Handles one MCP JSON-RPC message. `actor` must be an authenticated user; tool permissions are
 * enforced by the services.
 */
export async function handleCmsMcpRequest(
  body: { jsonrpc?: string; id?: string | number | null; method?: string; params?: any } | null,
  cms: Cms | null,
  actor?: CmsActor,
): Promise<any> {
  const id = body?.id ?? null;
  const reply = (result: unknown) => ({ jsonrpc: "2.0", id, result });
  const fail = (code: number, message: string, data?: unknown) => ({
    jsonrpc: "2.0",
    id,
    error: { code, message, ...(data !== undefined ? { data } : {}) },
  });

  switch (body?.method) {
    case "initialize":
      return reply({ protocolVersion: "2025-06-18", serverInfo: SERVER_INFO, capabilities: { tools: {} } });
    case "notifications/initialized":
    case "ping":
      return reply({});
    case "tools/list":
      return reply({ tools: CMS_MCP_TOOLS });
    case "tools/call": {
      const tool = tools.find((t) => t.name === body.params?.name);
      if (!tool) return fail(-32601, `Unknown tool: ${body.params?.name}`);
      if (!cms || !actor) return fail(-32001, "Unauthorized");
      const args = body.params?.arguments ?? {};
      const missing = (tool.inputSchema.required ?? []).filter((k) => args[k] === undefined);
      if (missing.length) return fail(-32602, `Missing required arguments: ${missing.join(", ")}`);
      try {
        const result = await tool.run(cms, actor, args);
        return reply({ content: [{ type: "text", text: JSON.stringify(result ?? { success: true }, null, 2) }] });
      } catch (err) {
        if (err instanceof CmsError) {
          return reply({ isError: true, content: [{ type: "text", text: `${err.status}: ${err.message}${err.details ? `\n${JSON.stringify(err.details)}` : ""}` }] });
        }
        throw err;
      }
    }
    default:
      return fail(-32601, `Method not found: ${body?.method ?? "(none)"}`);
  }
}
