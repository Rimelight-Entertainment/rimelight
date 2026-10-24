import { describe, it, expect } from "vite-plus/test";
import { DatabaseSync } from "node:sqlite";
import { drizzle } from "drizzle-orm/d1";
import { createCmsRouter } from "../src/server/router";
import { SQLITE_CMS_MIGRATIONS } from "../src/migrator/sql";
import { pages, pageDrafts, pageVersions } from "../src/schema/sqlite";
import { eq } from "drizzle-orm";

/**
 * Creates an in-memory SQLite database wrapped with a Cloudflare D1 mock interface.
 */
function createMockD1() {
  const syncDb = new DatabaseSync(":memory:");

  // Execute base SQLite migrations directly to set up tables
  for (const m of SQLITE_CMS_MIGRATIONS) {
    const stmts = m.sql
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const stmt of stmts) {
      syncDb.exec(stmt);
    }
  }

  const d1Binding = {
    prepare(query: string) {
      let bindings: any[] = [];
      return {
        bind(...args: any[]) {
          bindings = args;
          return this;
        },
        async all() {
          const stmt = syncDb.prepare(query);
          const results = stmt.all(...bindings);
          return { results, success: true };
        },
        async run() {
          const stmt = syncDb.prepare(query);
          const info = stmt.run(...bindings);
          return { success: true, meta: { changes: info.changes } };
        },
        async first(col?: string) {
          const stmt = syncDb.prepare(query);
          const row = stmt.get(...bindings) as any;
          if (!row) return null;
          return col ? row[col] : row;
        },
        async raw() {
          const stmt = syncDb.prepare(query);
          const rows = stmt.all(...bindings) as any[];
          return rows.map((r) => Object.values(r));
        },
      };
    },
    async batch(statements: any[]) {
      return Promise.all(statements.map((s) => (s.all ? s.all() : s.run())));
    },
    async exec(query: string) {
      syncDb.exec(query);
      return { count: 0, duration: 0 };
    },
  };

  return { syncDb, d1Binding };
}

describe("CMS D1 / SQLite End-to-End Test", () => {
  it("executes full page lifecycle on mock Cloudflare D1 instance", async () => {
    const { d1Binding } = createMockD1();
    const d1Db = drizzle(d1Binding as any);

    // 1. Create a page via Drizzle SQLite client
    const testPageId = crypto.randomUUID();
    await d1Db.insert(pages).values({
      id: testPageId,
      slug: "d1-test-page",
      type: "doc",
      title: { en: "D1 Test Page" },
      description: { en: "Testing D1 end-to-end support" },
      tags: [{ en: "d1" }, { en: "sqlite" }],
      content: {
        blocks: [
          {
            id: "b1",
            type: "ParagraphBlock",
            props: { text: { en: "Hello from D1 SQLite" } },
          },
        ],
        properties: {},
      },
    });

    // 2. Query page back and assert
    const [fetched] = await d1Db.select().from(pages).where(eq(pages.id, testPageId)).limit(1);
    expect(fetched).toBeDefined();
    expect(fetched?.slug).toBe("d1-test-page");
    expect(fetched?.title).toEqual({ en: "D1 Test Page" });
    expect(fetched?.content.blocks.length).toBe(1);

    // 3. Save a draft
    await d1Db.insert(pageDrafts).values({
      pageId: testPageId,
      content: {
        blocks: [
          {
            id: "b1",
            type: "ParagraphBlock",
            props: { text: { en: "Draft content on D1" } },
          },
        ],
        properties: { updated: true },
      },
      updatedBy: "test-user",
    });

    const [draft] = await d1Db
      .select()
      .from(pageDrafts)
      .where(eq(pageDrafts.pageId, testPageId))
      .limit(1);
    expect(draft).toBeDefined();
    expect(draft?.updatedBy).toBe("test-user");
    expect(draft?.content.properties).toEqual({ updated: true });

    // 4. Create an immutable published version
    const versionId = crypto.randomUUID();
    await d1Db.insert(pageVersions).values({
      id: versionId,
      pageId: testPageId,
      versionNumber: 1,
      status: "published",
      slug: "d1-test-page",
      type: "doc",
      title: { en: "D1 Test Page v1" },
      content: draft!.content,
      createdBy: "test-user",
    });

    // Update publishedVersionId on pages
    await d1Db
      .update(pages)
      .set({
        publishedVersionId: versionId,
        postedAt: new Date(),
      })
      .where(eq(pages.id, testPageId));

    const [publishedPage] = await d1Db
      .select()
      .from(pages)
      .where(eq(pages.id, testPageId))
      .limit(1);
    expect(publishedPage?.publishedVersionId).toBe(versionId);

    // 5. Test querying via createCmsRouter with D1 binding in env
    const router = createCmsRouter({
      schema: { pages },
    });

    const res = await router.request(
      "http://localhost/content/pages?type=doc",
      {},
      { DB: d1Binding },
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.pages.length).toBeGreaterThanOrEqual(1);
    const found = body.pages.find((p: any) => p.id === testPageId);
    expect(found).toBeDefined();
    expect(found.slug).toBe("d1-test-page");
  });
});
