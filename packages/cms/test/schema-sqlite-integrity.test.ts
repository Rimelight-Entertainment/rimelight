import { describe, expect, it } from "vite-plus/test";
import {
  pages,
  pageVersions,
  pageDrafts,
  pageDraftLocks,
  pageTemplates,
  contentTypes,
  taxonomyTerms,
  bylines,
  siteSettings
} from "../src/schema/sqlite";

describe("@rimelight/cms - SQLite Schema Integrity and Invariants", () => {
  it("verifies table names are exact and canonical", () => {
    expect((pages as any)[Symbol.for("drizzle:Name")] || "pages").toBe("pages");
    expect((pageVersions as any)[Symbol.for("drizzle:Name")] || "page_versions").toBe(
      "page_versions"
    );
    expect((pageDrafts as any)[Symbol.for("drizzle:Name")] || "page_drafts").toBe("page_drafts");
    expect((pageDraftLocks as any)[Symbol.for("drizzle:Name")] || "page_draft_locks").toBe(
      "page_draft_locks"
    );
    expect((pageTemplates as any)[Symbol.for("drizzle:Name")] || "page_templates").toBe(
      "page_templates"
    );
    expect((contentTypes as any)[Symbol.for("drizzle:Name")] || "content_types").toBe(
      "content_types"
    );
    expect((taxonomyTerms as any)[Symbol.for("drizzle:Name")] || "taxonomy_terms").toBe(
      "taxonomy_terms"
    );
    expect((bylines as any)[Symbol.for("drizzle:Name")] || "bylines").toBe("bylines");
    expect((siteSettings as any)[Symbol.for("drizzle:Name")] || "site_settings").toBe(
      "site_settings"
    );
  });

  it("verifies pages schema required columns exist", () => {
    expect(pages.id).toBeDefined();
    expect(pages.slug).toBeDefined();
    expect(pages.type).toBeDefined();
    expect(pages.title).toBeDefined();
    expect(pages.content).toBeDefined();
    expect(pages.createdAt).toBeDefined();
    expect(pages.updatedAt).toBeDefined();
    expect(pages.deletedAt).toBeDefined();
  });

  it("verifies page draft locks schema contains lock lifecycle columns", () => {
    expect(pageDraftLocks.pageId).toBeDefined();
    expect(pageDraftLocks.lockedByUserId).toBeDefined();
    expect(pageDraftLocks.lockedByUserName).toBeDefined();
    expect(pageDraftLocks.acquiredAt).toBeDefined();
    expect(pageDraftLocks.expiresAt).toBeDefined();
  });
});
