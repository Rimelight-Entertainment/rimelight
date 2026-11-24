import { describe, expect, it } from "vite-plus/test";
import {
  parseCollectionBody,
  collectionInUseMessage,
  SLUG_RE,
} from "../src/space/content/content-collections-logic.ts";
import {
  parseTemplateBody,
  localizedText,
  templateCollectionFilter,
} from "../src/space/content/content-templates-logic.ts";
import {
  sanitizeMediaFileName,
  buildMediaStorageKey,
  mediaKeyFromPath,
  mediaFolderValue,
  parseMediaAlt,
  mediaSizeOk,
  mediaAssetView,
  MEDIA_MAX_BYTES,
} from "../src/space/content/content-media-logic.ts";
import { validateScopeMove } from "../src/space/content/content-scope-logic.ts";

describe("scope move body", () => {
  const project = "7f3c2b1e-4d5a-4b6c-8d9e-0a1b2c3d4e5f";

  it("accepts a Company move with no scopeId", () => {
    expect(validateScopeMove({ scopeKind: "Company" })).toEqual({
      ok: true,
      kind: "Company",
      id: null,
    });
    expect(validateScopeMove({ scopeKind: "Company", scopeId: null })).toEqual({
      ok: true,
      kind: "Company",
      id: null,
    });
  });

  it("rejects a scopeId on a Company move", () => {
    expect(validateScopeMove({ scopeKind: "Company", scopeId: project }).ok).toBe(false);
  });

  it("requires a UUID scopeId for the other kinds and lower-cases it", () => {
    expect(validateScopeMove({ scopeKind: "Project", scopeId: project.toUpperCase() })).toEqual({
      ok: true,
      kind: "Project",
      id: project,
    });
    expect(validateScopeMove({ scopeKind: "Team" }).ok).toBe(false);
    expect(validateScopeMove({ scopeKind: "Department", scopeId: "not-a-uuid" }).ok).toBe(false);
  });

  it("rejects an unknown scope kind", () => {
    expect(validateScopeMove({ scopeKind: "Office", scopeId: project }).ok).toBe(false);
    expect(validateScopeMove({}).ok).toBe(false);
  });
});

describe("collection body", () => {
  it("validates a create and fills the defaults", () => {
    const parsed = parseCollectionBody({ slug: "news", label: "News" }, "create");
    expect(parsed).toEqual({
      ok: true,
      values: {
        slug: "news",
        name: { en: "News" },
        featuresPatch: { labelPlural: "News" },
        icon: "i-lucide-box",
        fieldSchema: { groups: {}, fields: {} },
      },
    });
  });

  it("keeps labelPlural in features and merges explicit features over it", () => {
    const parsed = parseCollectionBody(
      {
        slug: "docs",
        label: "Doc",
        labelPlural: "Docs",
        features: { comments: true },
        color: "#3b82f6",
      },
      "create",
    );
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.values.featuresPatch).toEqual({ comments: true, labelPlural: "Docs" });
      expect(parsed.values.color).toBe("#3b82f6");
    }
  });

  it("rejects a bad slug, label or colour", () => {
    expect(parseCollectionBody({ slug: "Bad Slug", label: "x" }, "create").ok).toBe(false);
    expect(parseCollectionBody({ slug: "ok", label: "" }, "create").ok).toBe(false);
    expect(parseCollectionBody({ slug: "ok", label: "x", color: "red" }, "create").ok).toBe(false);
  });

  it("checks fields shape: a fields map is required, groups optional", () => {
    expect(
      parseCollectionBody({ slug: "a", label: "A", fields: { fields: [] } }, "create").ok,
    ).toBe(false);
    const ok = parseCollectionBody(
      { slug: "a", label: "A", fields: { fields: { title: {} } } },
      "create",
    );
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.values.fieldSchema).toEqual({ groups: {}, fields: { title: {} } });
  });

  it("does not allow a slug change on update and needs one field", () => {
    expect(parseCollectionBody({ label: "Renamed" }, "update")).toEqual({
      ok: true,
      values: { name: { en: "Renamed" } },
    });
    expect(parseCollectionBody({}, "update").ok).toBe(false);
  });

  it("refuses a delete while pages exist", () => {
    expect(collectionInUseMessage(0)).toBeNull();
    expect(collectionInUseMessage(1)).toBe(
      "This collection has 1 page. Move or delete them first.",
    );
    expect(collectionInUseMessage(3)).toContain("3 pages");
  });

  it("uses the slug rule", () => {
    expect(SLUG_RE.test("a-b-1")).toBe(true);
    expect(SLUG_RE.test("-a")).toBe(false);
  });
});

describe("template body", () => {
  it("needs slug, title and collection on create", () => {
    const ok = parseTemplateBody({ slug: "t1", title: "Template", collection: "docs" }, "create");
    expect(ok).toEqual({
      ok: true,
      values: {
        slug: "t1",
        title: { en: "Template" },
        pageType: "docs",
        initialBlocks: [],
      },
    });
    expect(parseTemplateBody({ slug: "t1", title: "T" }, "create").ok).toBe(false);
    expect(parseTemplateBody({ title: "T", collection: "docs" }, "create").ok).toBe(false);
  });

  it("checks initialBlocks entries have a type", () => {
    expect(
      parseTemplateBody({ slug: "t", title: "T", collection: "c", initialBlocks: [{}] }, "create")
        .ok,
    ).toBe(false);
    expect(
      parseTemplateBody(
        { slug: "t", title: "T", collection: "c", initialBlocks: [{ type: "TextBlock" }] },
        "create",
      ).ok,
    ).toBe(true);
  });

  it("accepts localized titles and rejects empty ones", () => {
    expect(localizedText({ en: "Hi", fr: " Salut " }, 200)).toEqual({ en: "Hi", fr: "Salut" });
    expect(localizedText({ en: "  " }, 200)).toBeNull();
    expect(localizedText("", 200)).toBeNull();
  });

  it("treats a missing or blank collection filter as no filter", () => {
    expect(templateCollectionFilter(undefined)).toBeNull();
    expect(templateCollectionFilter("  ")).toBeNull();
    expect(templateCollectionFilter(" docs ")).toBe("docs");
  });
});

describe("media helpers", () => {
  it("strips the path and replaces unsafe characters", () => {
    expect(sanitizeMediaFileName("C:\\Users\\me\\My Photo (1).PNG")).toBe("My-Photo-1-.PNG");
    expect(sanitizeMediaFileName("../../etc/passwd")).toBe("passwd");
    expect(sanitizeMediaFileName("...hidden.txt")).toBe("hidden.txt");
    expect(sanitizeMediaFileName("")).toBe("file");
    expect(sanitizeMediaFileName(undefined)).toBe("file");
  });

  it("keeps the extension when cutting a long name", () => {
    const long = `${"a".repeat(300)}.pdf`;
    const cut = sanitizeMediaFileName(long);
    expect(Array.from(cut).length).toBeLessThanOrEqual(180);
    expect(cut.endsWith(".pdf")).toBe(true);
  });

  it("builds a content key under a UUID folder", () => {
    expect(buildMediaStorageKey("11111111-2222-4333-8444-555555555555", "a b.png")).toBe(
      "content/11111111-2222-4333-8444-555555555555/a-b.png",
    );
  });

  it("reads a storage key from the file path and refuses escapes", () => {
    expect(mediaKeyFromPath("/v1/content/media/file/content/abc/a%20b.png")).toBe(
      "content/abc/a b.png",
    );
    expect(mediaKeyFromPath("/v1/content/media/file/content/../secret")).toBeNull();
    expect(mediaKeyFromPath("/v1/content/media/file/other/abc.png")).toBeNull();
    expect(mediaKeyFromPath("/v1/content/media/file/content/%E0%A4%A")).toBeNull();
    expect(mediaKeyFromPath("/v1/content/media/other")).toBeNull();
  });

  it("reads the folder: empty is the root, too long is refused", () => {
    expect(mediaFolderValue(undefined)).toEqual({ ok: true, folder: null });
    expect(mediaFolderValue("  ")).toEqual({ ok: true, folder: null });
    expect(mediaFolderValue(" f1 ")).toEqual({ ok: true, folder: "f1" });
    expect(mediaFolderValue("x".repeat(101)).ok).toBe(false);
  });

  it("parses alt text", () => {
    expect(parseMediaAlt("Logo")).toEqual({ ok: true, alt: { en: "Logo" } });
    expect(parseMediaAlt("")).toEqual({ ok: true, alt: null });
    expect(parseMediaAlt(null)).toEqual({ ok: true, alt: null });
    expect(parseMediaAlt({ en: "Logo", fr: "" })).toEqual({ ok: true, alt: { en: "Logo" } });
    expect(parseMediaAlt(42).ok).toBe(false);
  });

  it("caps uploads at 50 MB", () => {
    expect(MEDIA_MAX_BYTES).toBe(50 * 1024 * 1024);
    expect(mediaSizeOk(MEDIA_MAX_BYTES)).toBe(true);
    expect(mediaSizeOk(MEDIA_MAX_BYTES + 1)).toBe(false);
    expect(mediaSizeOk(-1)).toBe(false);
  });

  it("views an asset with the public URL", () => {
    const view = mediaAssetView({
      id: "a1",
      storage_key: "content/a1/logo.png",
      mime_type: "image/png",
      size: 10,
      width: null,
      height: null,
      alt: { en: "Logo" },
      created_at: "2026-11-23T10:00:00Z",
    });
    expect(view).toEqual({
      id: "a1",
      key: "content/a1/logo.png",
      url: "/v1/content/media/file/content/a1/logo.png",
      alt: { en: "Logo" },
      width: null,
      height: null,
      mime: "image/png",
      size: 10,
      createdAt: "2026-11-23T10:00:00.000Z",
    });
  });
});
