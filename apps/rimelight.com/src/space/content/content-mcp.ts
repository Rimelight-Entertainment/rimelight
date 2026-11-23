/**
 * Rimelight Space content over MCP (CMS.3, decision 0049): POST /v1/content/mcp, JSON-RPC 2.0 with the Model Context
 * Protocol methods (initialize, tools/list, tools/call, notifications/initialized, ping). Same protocol handling as the
 * old CMS MCP (packages/cms/src/mcp), on the Space bearer session instead of the CMS actor.
 *
 * Every tool is a thin adapter over the same helpers the Space routes use, so the access rules are the same: pages
 * through content-access.ts, published reads filtered with filterBlocks for an employee, drafts through the draft
 * room. Drafts show every block to people with edit access (the live room cannot hide blocks, see
 * docs/cms-editor-design.md section 7), so get_draft is not filtered.
 */
import { Hono } from "hono";
import { getSql } from "../../db/index.ts";
import { caller, isResponse } from "../session.ts";
import { json, type Row } from "../canvas-access.ts";
import {
  type ContentBlock,
  callerRoles,
  draftView,
  filterBlocks,
  loadPage,
  pageAccess,
  pageFromRow,
} from "./content-access.ts";
import { createPageFromInput, pageSummary, pagesInScope, scopeFrom } from "./content-pages.ts";
import { openDraft, openableDraft, publishDraft } from "./content-drafts.ts";
import { docRoomStub } from "./content-live.ts";

import {
  CONTENT_MCP_TOOLS,
  dispatchMcp,
  McpToolError,
  optionalObject,
  requireArray,
  requireString,
  unwrap,
  type McpTool,
} from "./content-mcp-logic.ts";

/** The code of each tool in CONTENT_MCP_TOOLS, by name. */
const runners: Record<string, McpTool["run"]> = {
  list_collections: async ({ sql }) => {
    const rows = await sql`SELECT slug, name, description, icon, color, mode
       FROM content_types ORDER BY slug`;
    return {
      collections: rows.map((r) => ({
        slug: r["slug"],
        name: r["name"],
        description: r["description"] ?? null,
        icon: r["icon"],
        color: r["color"] ?? null,
        mode: r["mode"],
      })),
    };
  },
  list_pages: async ({ sql, userId }, args) =>
    unwrap(
      await pagesInScope(sql, userId, {
        scopeKind: args.scopeKind,
        scopeId: args.scopeId,
        type: typeof args.type === "string" ? args.type : null,
      }),
    ),
  get_page: async ({ sql, userId }, args) => {
    const found = await unwrap(await loadPage(sql, userId, requireString(args, "pageId"), "view"));
    const roles = await callerRoles(sql, userId);
    const blocks = filterBlocks(
      (found.page.content?.blocks ?? []) as ContentBlock[],
      roles,
      "employee",
    );
    return {
      ...pageSummary(found.page, found.access),
      content: { blocks, properties: found.page.content?.properties ?? {} },
    };
  },
  search_pages: async ({ sql, userId }, args) => {
    const q = requireString(args, "query").trim();
    const scope =
      args.scopeKind === undefined ? null : await unwrap(scopeFrom(args.scopeKind, args.scopeId));
    const pattern = `%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
    const kind = scope?.kind ?? null;
    const scopeId = scope?.id ?? null;
    const rows = await sql`SELECT id::text AS id, slug, type, title, description, scope_kind,
         scope_id::text AS scope_id, visibility, status, published_version_id::text AS published_version_id,
         created_at, updated_at
       FROM pages
       WHERE deleted_at IS NULL
         AND (${kind}::text IS NULL OR (scope_kind = ${kind}::text
              AND scope_id IS NOT DISTINCT FROM ${scopeId}::text::uuid))
         AND (slug ILIKE ${pattern}::text OR EXISTS (
              SELECT 1 FROM jsonb_each_text(CASE WHEN jsonb_typeof(title) = 'object' THEN title ELSE '{}'::jsonb END) t
              WHERE t.value ILIKE ${pattern}::text))
       ORDER BY updated_at DESC, id
       LIMIT 200`;

    // Access is checked per scope, once each, and the result is cut to 50 after the check.
    const access = new Map<string, Awaited<ReturnType<typeof pageAccess>>>();
    const pages: ReturnType<typeof pageSummary>[] = [];
    for (const r of rows as Row[]) {
      const page = pageFromRow(r);
      const key = `${page.scopeKind}:${page.scopeId ?? ""}`;
      let level = access.get(key);
      if (level === undefined) {
        level = await pageAccess(sql, userId, {
          scopeKind: page.scopeKind,
          scopeId: page.scopeId,
        });
        access.set(key, level);
      }
      if (level === "none") continue;
      pages.push(pageSummary(page, level));
      if (pages.length === 50) break;
    }
    return { pages };
  },
  create_page: async ({ sql, userId }, args) =>
    unwrap(await createPageFromInput(sql, userId, args ?? {})),
  open_draft: async (ctx, args) => {
    const { sql, userId } = ctx;
    const found = await unwrap(await loadPage(sql, userId, requireString(args, "pageId"), "edit"));
    const opened = await unwrap(await openDraft(sql, { id: userId }, found.page.id));
    return { ...draftView(opened.draft), created: opened.created };
  },
  get_draft: async ({ sql, userId }, args) => {
    const { draft } = await unwrap(
      await openableDraft(sql, userId, requireString(args, "draftId")),
    );
    const room = docRoomStub(`draft:${draft.id}`);
    await room.init({ kind: "draft", pageId: draft.pageId, draftId: draft.id });
    const snap = await room.snapshotJson();
    return {
      ...draftView(draft),
      content: { blocks: snap.content["blocks"], properties: snap.content["properties"] },
    };
  },
  replace_draft_content: async ({ sql, userId }, args) => {
    const { draft } = await unwrap(
      await openableDraft(sql, userId, requireString(args, "draftId")),
    );
    if (draft.status !== "Open") {
      throw new McpToolError(409, "This draft is not open, so its content cannot change.");
    }
    const blocks = requireArray(args, "blocks");
    const room = docRoomStub(`draft:${draft.id}`);
    await room.init({ kind: "draft", pageId: draft.pageId, draftId: draft.id });
    const properties =
      optionalObject(args, "properties") ?? (await room.snapshotJson()).content["properties"];
    try {
      await room.replaceContent({ blocks, properties: properties as Record<string, unknown> });
    } catch (err) {
      // A block that does not fit the document format, or a closed room.
      // UNSURE: a closed room should probably be 409, not 400; only the message tells them apart for now.
      throw new McpToolError(400, err instanceof Error ? err.message : "The content was refused.");
    }
    return { draft_id: draft.id, blocks: blocks.length, updated: true };
  },
  publish_draft: async (ctx, args) => {
    const raw = typeof args?.summary === "string" ? args.summary.trim() : "";
    if (Array.from(raw).length > 1000)
      throw new McpToolError(400, "summary is at most 1000 characters.");
    return unwrap(
      await publishDraft(
        ctx.sql,
        { id: ctx.userId },
        requireString(args, "draftId"),
        raw === "" ? null : raw,
      ),
    );
  },
};

const tools: McpTool[] = CONTENT_MCP_TOOLS.map((meta) => {
  const run = runners[meta.name];
  if (!run) throw new Error(`MCP tool without code: ${meta.name}`);
  return { ...meta, run };
});

const mcp = new Hono();

/** POST /v1/content/mcp: one JSON-RPC message from an MCP client, signed in with a Space session. */
mcp.post("/content/mcp", async (c) => {
  const who = await caller(c);
  if (isResponse(who)) return who;
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error." } });
  }
  try {
    const reply = await dispatchMcp(body, tools, { sql: getSql(), userId: who.id });
    return json(reply);
  } catch (err) {
    console.error("space POST /content/mcp failed", err);
    const id = (body as { id?: string | number | null } | null)?.id ?? null;
    return json({ jsonrpc: "2.0", id, error: { code: -32603, message: "Internal error." } });
  }
});

export default mcp;
