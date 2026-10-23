import { describe, expect, it } from "vite-plus/test";
import { SQLITE_CMS_MIGRATIONS, PG_CMS_MIGRATIONS } from "../src/migrator/sql";
import { migrateCms } from "../src/migrator/index";

describe("@rimelight/cms Migrator", () => {
  it("has valid SQL migrations for SQLite and PG", () => {
    expect(SQLITE_CMS_MIGRATIONS.length).toBeGreaterThan(0);
    expect(PG_CMS_MIGRATIONS.length).toBeGreaterThan(0);
    expect(SQLITE_CMS_MIGRATIONS[0]?.name).toBe("0001_initial_cms_tables");
    expect(PG_CMS_MIGRATIONS[0]?.name).toBe("0001_initial_cms_tables");
  });

  it("successfully applies migrations on mock D1 binding", async () => {
    const executedQueries: string[] = [];
    const mockD1 = {
      prepare(query: string) {
        executedQueries.push(query);
        return {
          bind(..._args: any[]) {
            return this;
          },
          run: async () => ({ success: true }),
          all: async () => ({ results: [] }),
        };
      },
      batch: async (statements: any[]) => {
        return statements.map(() => ({ success: true }));
      },
    };

    const result = await migrateCms(mockD1);
    expect(result.dialect).toBe("sqlite");
    expect(result.applied).toContain("0001_initial_cms_tables");
    expect(result.skipped.length).toBe(0);

    // Second run should skip already executed migrations
    const mockD1SecondRun = {
      prepare(_query: string) {
        return {
          bind(..._args: any[]) {
            return this;
          },
          run: async () => ({ success: true }),
          all: async () => ({ results: [{ name: "0001_initial_cms_tables" }] }),
        };
      },
      batch: async (statements: any[]) => {
        return statements.map(() => ({ success: true }));
      },
    };

    const secondResult = await migrateCms(mockD1SecondRun);
    expect(secondResult.applied.length).toBe(0);
    expect(secondResult.skipped).toContain("0001_initial_cms_tables");
  });
});
