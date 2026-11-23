/**
 * The Space content MCP server's protocol and tool descriptions (content-mcp.ts runs the tools). Kept apart from the
 * route and the tool code so tests can load them without the Workers runtime.
 */
import type { Sql } from "../canvas-access.ts";

/** Who is calling and the database to read and write with. */
export type McpContext = { sql: Sql; userId: string };

type JsonSchema = { type: "object"; properties: Record<string, unknown>; required?: string[] };

export type McpTool = {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  run: (ctx: McpContext, args: any) => Promise<unknown>;
};

/** A refusal a tool reports to the agent as an isError result, with the HTTP status it would have had. */
export class McpToolError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const SERVER_INFO = { name: "rimelight-space-content", version: "1.0.0" };
export const PROTOCOL_VERSION = "2025-06-18";

export const str = (description: string) => ({ type: "string", description });
export const obj = (description: string) => ({ type: "object", description });
export const arr = (description: string) => ({
  type: "array",
  description,
  items: { type: "object" },
});
export const schema = (
  properties: Record<string, unknown>,
  required: string[] = [],
): JsonSchema => ({
  type: "object",
  properties,
  ...(required.length ? { required } : {}),
});

export const SCOPE_HINT =
  "scopeKind is Project, Team, Department or Company; scopeId is the id (omit for Company).";
export const BLOCKS_HINT =
  "Block tree: [{ id: uuid, type, props, children? }]. Blocks a viewer may not see are dropped on published reads.";

/** A tool as tools/list describes it (no code). */
export type McpToolMeta = Omit<McpTool, "run">;

/**
 * Turns a Response from a shared helper into a value, or throws the refusal as a McpToolError. The helpers return a
 * Response for every refusal (404, 403, 409, 400), so this keeps one set of rules for the routes and the tools.
 */
export async function unwrap<T>(value: T | Response): Promise<T> {
  if (value instanceof Response) {
    const body = (await value.json().catch(() => ({}))) as { message?: unknown };
    throw new McpToolError(
      value.status,
      typeof body.message === "string" ? body.message : "The request was refused.",
    );
  }
  return value;
}

export function requireString(args: any, key: string): string {
  const v = args?.[key];
  if (typeof v !== "string" || v.trim() === "") throw new McpToolError(400, `${key} is required.`);
  return v;
}

export function requireArray(args: any, key: string): unknown[] {
  const v = args?.[key];
  if (!Array.isArray(v)) throw new McpToolError(400, `${key} must be an array.`);
  return v;
}

export function optionalObject(args: any, key: string): Record<string, unknown> | undefined {
  const v = args?.[key];
  if (v === undefined) return undefined;
  if (typeof v !== "object" || v === null || Array.isArray(v)) {
    throw new McpToolError(400, `${key} must be an object.`);
  }
  return v as Record<string, unknown>;
}

/** The tools, as tools/list returns them; content-mcp.ts supplies the code for each by name. */
export const CONTENT_MCP_TOOLS: McpToolMeta[] = [
  {
    name: "list_collections",
    description: "List the content types (collections) pages can be created with.",
    inputSchema: schema({}),
  },
  {
    name: "list_pages",
    description: `List the pages in a scope the caller can view, newest first. ${SCOPE_HINT}`,
    inputSchema: schema(
      {
        scopeKind: str("Project | Team | Department | Company"),
        scopeId: str("Project, team or department id (omit for Company)"),
        type: str("Content type slug to filter by"),
      },
      ["scopeKind"],
    ),
  },
  {
    name: "get_page",
    description:
      "Get a page's published content (blocks and properties), with the blocks this caller may see.",
    inputSchema: schema({ pageId: str("Page id") }, ["pageId"]),
  },
  {
    name: "search_pages",
    description:
      "Search pages by title or slug (case-insensitive text match). Only pages the caller can view are returned.",
    inputSchema: schema(
      {
        query: str("Text to find in titles and slugs"),
        scopeKind: str("Optional: limit to Project | Team | Department | Company"),
        scopeId: str("Optional: the project, team or department id"),
      },
      ["query"],
    ),
  },
  {
    name: "create_page",
    description: `Create an empty draft page (Internal). Needs edit on the scope. ${SCOPE_HINT}`,
    inputSchema: schema(
      {
        scopeKind: str("Project | Team | Department | Company"),
        scopeId: str("Project, team or department id (omit for Company)"),
        type: str("Content type slug (see list_collections)"),
        slug: str("Lower-case letters, digits and hyphens, 1 to 100 characters"),
        title: str("Page title, 1 to 200 characters"),
      },
      ["scopeKind", "type", "slug", "title"],
    ),
  },
  {
    name: "open_draft",
    description:
      "Open the caller's draft of a page, created if there is none. Needs edit on the page. The draft is a copy of the page's current content.",
    inputSchema: schema({ pageId: str("Page id") }, ["pageId"]),
  },
  {
    name: "get_draft",
    description:
      "Get a draft's current content as the editor sees it (every block, live state). Only the author and the draft's members.",
    inputSchema: schema({ draftId: str("Draft id") }, ["draftId"]),
  },
  {
    name: "replace_draft_content",
    description: `Replace a draft's blocks (and properties, if given) in one change. The draft must be open. Live editors see it at once. ${BLOCKS_HINT}`,
    inputSchema: schema(
      {
        draftId: str("Draft id"),
        blocks: arr("Full block tree"),
        properties: obj("Field values. Omit to keep the draft's current properties."),
      },
      ["draftId", "blocks"],
    ),
  },
  {
    name: "publish_draft",
    description:
      "Publish a draft: merge it into the page. With approval rules on the page's template the draft goes to review instead (status in_review).",
    inputSchema: schema({ draftId: str("Draft id"), summary: str("What changed (optional)") }, [
      "draftId",
    ]),
  },
];

/**
 * Handles one JSON-RPC message against a tool table. `ctx` is the signed-in caller (null means no session, so tool
 * calls are refused). Exported with the table so the protocol can be tested without a database.
 */
export async function dispatchMcp(
  body: unknown,
  table: McpTool[],
  ctx: McpContext | null,
): Promise<Record<string, unknown>> {
  const msg = (typeof body === "object" && body !== null && !Array.isArray(body) ? body : {}) as {
    id?: string | number | null;
    method?: unknown;
    params?: any;
  };
  const id = msg.id ?? null;
  const reply = (result: unknown) => ({ jsonrpc: "2.0", id, result });
  const fail = (code: number, message: string) => ({
    jsonrpc: "2.0",
    id,
    error: { code, message },
  });

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return fail(-32600, "Invalid request: expected one JSON-RPC message.");
  }

  switch (msg.method) {
    case "initialize":
      return reply({
        protocolVersion: PROTOCOL_VERSION,
        serverInfo: SERVER_INFO,
        capabilities: { tools: {} },
      });
    case "notifications/initialized":
    case "ping":
      return reply({});
    case "tools/list":
      return reply({ tools: table.map(({ run: _run, ...t }) => t) });
    case "tools/call": {
      const name = msg.params?.name;
      const tool = table.find((t) => t.name === name);
      if (!tool) return fail(-32601, `Unknown tool: ${String(name)}`);
      if (!ctx) return fail(-32001, "Unauthorized");
      const args = msg.params?.arguments ?? {};
      const missing = (tool.inputSchema.required ?? []).filter((k) => args[k] === undefined);
      if (missing.length) return fail(-32602, `Missing required arguments: ${missing.join(", ")}`);
      try {
        const result = await tool.run(ctx, args);
        return reply({
          content: [{ type: "text", text: JSON.stringify(result ?? { success: true }, null, 2) }],
        });
      } catch (err) {
        if (err instanceof McpToolError) {
          return reply({
            isError: true,
            content: [{ type: "text", text: `${err.status}: ${err.message}` }],
          });
        }
        throw err;
      }
    }
    default:
      return fail(
        -32601,
        `Method not found: ${typeof msg.method === "string" ? msg.method : "(none)"}`,
      );
  }
}
