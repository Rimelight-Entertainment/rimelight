import { describe, expect, it } from "vite-plus/test";
import { PG_CMS_MIGRATIONS, SQLITE_CMS_MIGRATIONS } from "../src/migrator/sql";
import { migrateCms } from "../src/migrator/index";
import { DATA_MIGRATIONS } from "../src/migrator/data";
import { createMockD1 } from "./helpers/d1";

describe("migrator", () => {
  it("ships the same migration names for both dialects, in order", () => {
    expect(SQLITE_CMS_MIGRATIONS.map((m) => m.name)).toEqual(PG_CMS_MIGRATIONS.map((m) => m.name));
    expect(SQLITE_CMS_MIGRATIONS.map((m) => m.name)).toEqual([
      "0001_initial_cms_tables",
      "0002_collections_and_lifecycle",
      "0006_collection_color",
    ]);
  });

  it("applies every migration on a fresh D1 database and is idempotent", async () => {
    const { binding, raw } = createMockD1();
    const first = await migrateCms(binding);
    expect(first.dialect).toBe("sqlite");
    expect(first.applied).toEqual([
      ...SQLITE_CMS_MIGRATIONS.map((m) => m.name),
      ...DATA_MIGRATIONS.map((m) => m.name),
    ]);

    const cols = (raw.prepare("PRAGMA table_info(pages)").all() as any[]).map((c) => c.name);
    expect(cols).toContain("status");
    expect(cols).toContain("scheduled_at");

    const second = await migrateCms(binding);
    expect(second.applied).toEqual([]);
    expect(second.skipped.length).toBe(SQLITE_CMS_MIGRATIONS.length + DATA_MIGRATIONS.length);
  });

  it("tolerates columns that already exist (databases created by drizzle push)", async () => {
    const { binding, raw } = createMockD1();
    // Simulate 0001 + a manual column add, without the tracking row for 0002.
    await migrateCms(binding);
    raw.exec("DELETE FROM _rimelight_cms_migrations WHERE name = '0002_collections_and_lifecycle'");
    const again = await migrateCms(binding);
    expect(again.applied).toEqual(["0002_collections_and_lifecycle"]);
  });

  it("migrates legacy rows: published status, canonical type and block shapes", async () => {
    const { binding, raw } = createMockD1();
    const [m1] = SQLITE_CMS_MIGRATIONS;
    for (const stmt of m1!.sql
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean))
      raw.exec(stmt);
    raw.exec(
      `CREATE TABLE _rimelight_cms_migrations (id text PRIMARY KEY, name text NOT NULL, applied_at integer NOT NULL)`,
    );
    raw.exec(`INSERT INTO _rimelight_cms_migrations VALUES ('x', '0001_initial_cms_tables', 0)`);
    const legacy = JSON.stringify({
      blocks: [
        {
          id: "s",
          type: "SectionBlock",
          props: {
            title: "S",
            children: [{ id: "p", type: "ParagraphBlock", props: { text: { en: "hi" } } }],
          },
        },
      ],
      properties: {},
    });
    raw.exec(
      `INSERT INTO pages (id, slug, type, title, content, created_at) VALUES ('p1', 'legacy', 'BlogPost', '{"en":"Legacy"}', '${legacy}', 0)`,
    );
    await migrateCms(binding);
    const row = raw.prepare("SELECT status, type, content FROM pages WHERE id = 'p1'").get() as any;
    expect(row.status).toBe("published");
    expect(row.type).toBe("blog");
    const content = JSON.parse(row.content);
    expect(content.blocks[0].children[0].props.text).toEqual([{ type: "text", text: "hi" }]);
    expect(content.blocks[0].props.children).toBeUndefined();
  });
});
