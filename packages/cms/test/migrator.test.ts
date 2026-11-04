import { describe, expect, it } from "vite-plus/test";
import { PG_CMS_MIGRATIONS, SQLITE_CMS_MIGRATIONS } from "../src/migrator/sql";
import { migrateCms } from "../src/migrator/index";
import { createMockD1 } from "./helpers/d1";

describe("migrator", () => {
  it("ships the same migration names for both dialects, in order", () => {
    expect(SQLITE_CMS_MIGRATIONS.map((m) => m.name)).toEqual(PG_CMS_MIGRATIONS.map((m) => m.name));
    expect(SQLITE_CMS_MIGRATIONS.map((m) => m.name)).toEqual([
      "0001_initial_cms_tables",
      "0002_collections_and_lifecycle",
      "0006_collection_color",
      "0008_taxonomies_and_retired_columns",
      "0009_drop_legacy_schema_column",
      "0010_media_library",
    ]);
  });

  it("applies every migration on a fresh D1 database and is idempotent", async () => {
    const { binding, raw } = createMockD1();
    const first = await migrateCms(binding);
    expect(first.dialect).toBe("sqlite");
    expect(first.applied).toEqual(SQLITE_CMS_MIGRATIONS.map((m) => m.name));

    const cols = (raw.prepare("PRAGMA table_info(pages)").all() as any[]).map((c) => c.name);
    expect(cols).toContain("status");
    expect(cols).toContain("scheduled_at");

    const contentTypeCols = (raw.prepare("PRAGMA table_info(content_types)").all() as any[]).map(
      (c) => c.name,
    );
    expect(contentTypeCols).not.toContain("is_system");
    expect(contentTypeCols).not.toContain("ecom_settings");

    const second = await migrateCms(binding);
    expect(second.applied).toEqual([]);
    expect(second.skipped.length).toBe(SQLITE_CMS_MIGRATIONS.length);
  });

  it("tolerates columns that already exist (databases created by drizzle push)", async () => {
    const { binding, raw } = createMockD1();
    // Simulate 0001 + a manual column add, without the tracking row for 0002.
    await migrateCms(binding);
    raw.exec("DELETE FROM _rimelight_cms_migrations WHERE name = '0002_collections_and_lifecycle'");
    const again = await migrateCms(binding);
    expect(again.applied).toEqual(["0002_collections_and_lifecycle"]);
  });
});
