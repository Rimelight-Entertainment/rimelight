import { beforeEach, describe, expect, it } from "vite-plus/test";
import { drizzle } from "drizzle-orm/d1";
import { migrateCms } from "../src/migrator/index";
import { createCmsApi } from "../src/server/router";
import { CMS_MCP_TOOLS } from "../src/mcp/index";
import { createMockD1 } from "./helpers/d1";

let app: ReturnType<typeof createCmsApi>;

beforeEach(async () => {
  const { binding } = createMockD1();
  await migrateCms(binding);
  app = createCmsApi({
    db: drizzle(binding),
    // Tests authenticate with a header instead of cookies.
    getSession: async (req) => {
      const role = req.headers.get("x-role");
      return role ? { userId: `${role}-user`, name: role, roles: [role], permissions: [] } : null;
    },
  });
});

const call = (method: string, path: string, body?: unknown, role: string | null = "admin") =>
  app.request(path, {
    method,
    headers: { ...(role ? { "x-role": role } : {}), ...(body ? { "content-type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

describe("admin API", () => {
  it("requires authentication", async () => {
    expect((await call("GET", "/cms/entries", undefined, null)).status).toBe(401);
    expect((await call("POST", "/cms/mcp", { method: "tools/list" }, null)).status).toBe(401);
  });

  it("runs create → draft → publish over HTTP and serves it publicly", async () => {
    const created = await call("POST", "/cms/entries", { collection: "blog", title: "Launch" });
    expect(created.status).toBe(201);
    const { entry } = (await created.json()) as any;

    // Not public yet.
    expect((await call("GET", "/content/collections/blog/launch", undefined, null)).status).toBe(404);

    const blocks = [{ id: crypto.randomUUID(), type: "ParagraphBlock", props: { text: [{ type: "text", text: "We're live" }] } }];
    expect((await call("PUT", `/cms/entries/${entry.id}/draft`, { blocks })).status).toBe(200);
    expect((await call("POST", `/cms/entries/${entry.id}/publish`, {})).status).toBe(200);

    const pub = await call("GET", "/content/collections/blog/launch", undefined, null);
    expect(pub.status).toBe(200);
    const { entry: live } = (await pub.json()) as any;
    expect(live.collection).toBe("blog");
    expect(live.blocks[0].props.text[0].text).toBe("We're live");
    const md = await call("GET", "/content/collections/blog/launch.md", undefined, null);
    expect(await md.text()).toContain("We're live");

    const list = (await (await call("GET", "/content/collections/blog", undefined, null)).json()) as any;
    expect(list.total).toBe(1);
  });

  it("maps service errors to HTTP statuses", async () => {
    expect((await call("GET", "/cms/entries/does-not-exist")).status).toBe(404);
    expect((await call("POST", "/cms/collections", { slug: "x", label: "X" }, "editor")).status).toBe(403);
    expect((await call("POST", "/cms/entries", { collection: "nope", title: "x" })).status).toBe(404);
  });

  it("filters role-restricted blocks for anonymous readers", async () => {
    const { entry } = (await (await call("POST", "/cms/entries", { collection: "page", title: "Secret" })).json()) as any;
    const blocks = [
      { id: crypto.randomUUID(), type: "ParagraphBlock", props: { text: [{ type: "text", text: "public" }] } },
      { id: crypto.randomUUID(), type: "ParagraphBlock", props: { text: [{ type: "text", text: "staff" }] }, allowedRoles: ["employee"] },
    ];
    await call("PUT", `/cms/entries/${entry.id}/draft`, { blocks });
    await call("POST", `/cms/entries/${entry.id}/publish`, {});
    const { entry: page } = (await (await call("GET", "/content/collections/page/secret", undefined, null)).json()) as any;
    expect(page.blocks).toHaveLength(1);
  });
});

describe("MCP", () => {
  it("lists tools and calls them with the caller's permissions", async () => {
    const list = (await (await call("POST", "/cms/mcp", { jsonrpc: "2.0", id: 1, method: "tools/list" })).json()) as any;
    expect(list.result.tools.map((t: any) => t.name)).toEqual(CMS_MCP_TOOLS.map((t) => t.name));

    const created = (await (
      await call("POST", "/cms/mcp", { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "cms_create_entry", arguments: { collection: "doc", title: { en: "MCP doc" } } } })
    ).json()) as any;
    expect(JSON.parse(created.result.content[0].text).slug).toBe("mcp-doc");

    const denied = (await (
      await call("POST", "/cms/mcp", { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "cms_create_collection", arguments: { slug: "x", label: "X" } } }, "editor")
    ).json()) as any;
    expect(denied.result.isError).toBe(true);

    const missing = (await (
      await call("POST", "/cms/mcp", { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "cms_get_entry", arguments: {} } })
    ).json()) as any;
    expect(missing.error.code).toBe(-32602);
  });
});
