import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import {
  CONTENT_MCP_TOOLS,
  dispatchMcp,
  McpToolError,
  type McpTool,
} from "../src/space/content/content-mcp-logic.ts";
import {
  exportPage,
  importPage,
  normalizePage,
  replaceContent,
} from "../src/space/content/collab/index.ts";

// content-mcp.ts loads the database and the Worker bindings through its imports. The pure parts tested here need
// neither, so the Worker module is replaced with a stub.
// UNSURE: vitest may need an alias for "cloudflare:workers" instead of this mock if it cannot resolve the scheme.

const fixturesDir = `${resolve(dirname(fileURLToPath(import.meta.url)), "fixtures/content")}/`;
const fixture = (name: string) => JSON.parse(readFileSync(`${fixturesDir}${name}`, "utf8"));

const ctx = { sql: {} as never, userId: "11111111-1111-4111-8111-111111111111" };

const table: McpTool[] = [
  {
    name: "echo",
    description: "Echo the text back.",
    inputSchema: {
      type: "object",
      properties: { text: { type: "string" } },
      required: ["text"],
    },
    run: async (c, args) => ({ said: args.text, user: c.userId }),
  },
  {
    name: "refuse",
    description: "Always refused.",
    inputSchema: { type: "object", properties: {} },
    run: async () => {
      throw new McpToolError(409, "This draft is closed.");
    },
  },
  {
    name: "boom",
    description: "Fails inside.",
    inputSchema: { type: "object", properties: {} },
    run: async () => {
      throw new Error("database down");
    },
  },
];

describe("MCP protocol", () => {
  it("answers initialize with the protocol version and tools capability", async () => {
    const reply = await dispatchMcp({ jsonrpc: "2.0", id: 1, method: "initialize" }, table, ctx);
    expect(reply["id"]).toBe(1);
    const result = reply["result"] as Record<string, unknown>;
    expect(result["protocolVersion"]).toBe("2025-06-18");
    expect(result["capabilities"]).toEqual({ tools: {} });
  });

  it("answers ping and notifications/initialized with an empty result", async () => {
    expect(await dispatchMcp({ jsonrpc: "2.0", id: 2, method: "ping" }, table, ctx)).toEqual({
      jsonrpc: "2.0",
      id: 2,
      result: {},
    });
    const initialized = await dispatchMcp(
      { jsonrpc: "2.0", method: "notifications/initialized" },
      table,
      ctx,
    );
    expect(initialized["result"]).toEqual({});
  });

  it("lists the tools of the table without their run functions", async () => {
    const reply = await dispatchMcp({ jsonrpc: "2.0", id: 3, method: "tools/list" }, table, ctx);
    const tools = (reply["result"] as { tools: Array<Record<string, unknown>> }).tools;
    expect(tools.map((t) => t["name"])).toEqual(["echo", "refuse", "boom"]);
    expect(tools.every((t) => !("run" in t))).toBe(true);
  });

  it("runs a tool and returns its result as JSON text", async () => {
    const reply = await dispatchMcp(
      {
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: { name: "echo", arguments: { text: "hi" } },
      },
      table,
      ctx,
    );
    const result = reply["result"] as { content: Array<{ type: string; text: string }> };
    expect(JSON.parse(result.content[0]!.text)).toEqual({ said: "hi", user: ctx.userId });
  });

  it("reports a refusal as an isError result with its status", async () => {
    const reply = await dispatchMcp(
      { jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "refuse" } },
      table,
      ctx,
    );
    expect(reply["result"]).toEqual({
      isError: true,
      content: [{ type: "text", text: "409: This draft is closed." }],
    });
  });

  it("lets an unexpected tool error through to the route", async () => {
    await expect(
      dispatchMcp(
        { jsonrpc: "2.0", id: 6, method: "tools/call", params: { name: "boom" } },
        table,
        ctx,
      ),
    ).rejects.toThrow("database down");
  });

  it("returns JSON-RPC errors for bad requests", async () => {
    const code = async (body: unknown, c = ctx) => {
      const reply = await dispatchMcp(body, table, c);
      return (reply["error"] as { code: number } | undefined)?.code;
    };
    expect(await code({ jsonrpc: "2.0", id: 7, method: "nope" })).toBe(-32601);
    expect(await code(null)).toBe(-32600);
    expect(await code([{ jsonrpc: "2.0", method: "ping" }])).toBe(-32600);
    expect(await code({ jsonrpc: "2.0", method: "tools/call", params: { name: "gone" } })).toBe(
      -32601,
    );
    expect(await code({ jsonrpc: "2.0", method: "tools/call", params: { name: "echo" } })).toBe(
      -32602,
    );
    expect(
      await code(
        {
          jsonrpc: "2.0",
          method: "tools/call",
          params: { name: "echo", arguments: { text: "x" } },
        },
        null as never,
      ),
    ).toBe(-32001);
  });
});

describe("content MCP tools", () => {
  it("exposes the Space content tools", () => {
    expect(CONTENT_MCP_TOOLS.map((t) => t.name)).toEqual([
      "list_collections",
      "list_pages",
      "get_page",
      "search_pages",
      "create_page",
      "open_draft",
      "get_draft",
      "replace_draft_content",
      "publish_draft",
    ]);
  });

  it("gives every tool an object schema whose required keys are declared properties", () => {
    for (const tool of CONTENT_MCP_TOOLS) {
      expect(tool.inputSchema.type).toBe("object");
      for (const key of tool.inputSchema.required ?? []) {
        expect(Object.keys(tool.inputSchema.properties)).toContain(key);
      }
    }
  });
});

describe("replaceContent", () => {
  it("replaces the blocks and properties, keeps the meta fields", () => {
    const before = fixture("docs-guide.page.json");
    const next = fixture("screenplay.page.json");

    const doc = importPage(before);
    replaceContent(doc, next.content);

    const out = exportPage(doc);
    expect(out.content).toEqual(normalizePage(next).content);
    expect(out.meta).toEqual(exportPage(importPage(before)).meta);
  });

  it("leaves the document as it was when the content does not fit the format", () => {
    const before = fixture("docs-guide.page.json");
    const doc = importPage(before);
    const original = exportPage(doc);

    expect(() =>
      replaceContent(doc, { blocks: [{ id: "x", props: {} }], properties: {} }),
    ).toThrow();
    expect(exportPage(doc)).toEqual(original);
  });
});
