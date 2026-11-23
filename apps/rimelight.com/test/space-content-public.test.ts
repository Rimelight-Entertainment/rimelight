import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import {
  bylineView,
  cacheControl,
  cacheControlFor,
  collectionColor,
  entryFromRow,
  entryHref,
  fillMentions,
  isoOrNull,
  mentionIds,
  parseJson,
  readerRolesFor,
  resolveLabel,
  termView,
  type CollectionInfo,
  type MentionTarget,
} from "../src/space/content/content-public-logic.ts";

// content-public.ts loads the database through its imports (db/index.ts reads cloudflare:workers). The pure parts
// tested here need neither, so the Worker module is replaced with a stub.

const fixturesDir = `${resolve(dirname(fileURLToPath(import.meta.url)), "fixtures/content")}/`;
const fixture = (name: string) => JSON.parse(readFileSync(`${fixturesDir}${name}`, "utf8"));

const PAGE = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const TARGET_PUBLIC = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const TARGET_INTERNAL = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const TARGET_UNKNOWN = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";

const guide = fixture("docs-guide.page.json");

/** A pages row as the public SQL returns it (snake_case columns, jsonb already parsed). */
function row(content: unknown, overrides: Record<string, unknown> = {}) {
  return {
    id: PAGE,
    type: "doc",
    slug: "docs/guide",
    title: guide.meta.title,
    description: guide.meta.description,
    tags: guide.meta.tags ?? [],
    bylines: [],
    content,
    posted_at: new Date("2026-11-01T10:00:00Z"),
    updated_at: new Date("2026-11-02T10:00:00Z"),
    ...overrides,
  };
}

describe("parseJson and isoOrNull", () => {
  it("parses text jsonb and passes parsed values through", () => {
    expect(parseJson('{"en":"Hi"}')).toEqual({ en: "Hi" });
    expect(parseJson({ en: "Hi" })).toEqual({ en: "Hi" });
    expect(parseJson("not json")).toBe("not json");
  });

  it("gives ISO strings for timestamps and null for missing or invalid ones", () => {
    expect(isoOrNull(new Date("2026-11-01T10:00:00Z"))).toBe("2026-11-01T10:00:00.000Z");
    expect(isoOrNull(null)).toBeNull();
    expect(isoOrNull("garbage")).toBeNull();
  });
});

describe("entryFromRow", () => {
  it("maps a public row to the PublicEntry shape", () => {
    const entry = entryFromRow(row(guide.content), [
      { taxonomy: "tag", slug: "docs", label: { en: "Docs" } },
    ]);
    expect(entry.id).toBe(PAGE);
    expect(entry.collection).toBe("doc");
    expect(entry.slug).toBe("docs/guide");
    expect(entry.title).toEqual(guide.meta.title);
    expect(entry.publishedAt).toBe("2026-11-01T10:00:00.000Z");
    expect(entry.updatedAt).toBe("2026-11-02T10:00:00.000Z");
    expect(entry.blocks.map((b) => b["id"])).toEqual(guide.content.blocks.map((b: any) => b.id));
    expect(entry.properties).toEqual(guide.content.properties ?? {});
    expect(entry.terms).toEqual([{ taxonomy: "tag", slug: "docs", label: { en: "Docs" } }]);
  });

  it("returns no blocks and no properties when content is left out (list with content=false)", () => {
    const entry = entryFromRow(row(guide.content), [], false);
    expect(entry.blocks).toEqual([]);
    expect(entry.properties).toEqual({});
  });

  it("drops role-gated, permission-gated and internal blocks, including nested ones", () => {
    const blocks = [
      ...guide.content.blocks,
      {
        id: "11111111-1111-4111-8111-111111111111",
        type: "ParagraphBlock",
        props: {},
        visibility: "internal",
      },
      {
        id: "22222222-2222-4222-8222-222222222222",
        type: "ParagraphBlock",
        props: {},
        allowedRoles: ["member"],
      },
      {
        id: "33333333-3333-4333-8333-333333333333",
        type: "ParagraphBlock",
        props: {},
        requiredPermission: "manage",
      },
      {
        id: "44444444-4444-4444-8444-444444444444",
        type: "SectionBlock",
        props: {},
        children: [
          {
            id: "55555555-5555-4555-8555-555555555555",
            type: "ParagraphBlock",
            props: {},
            visibility: "internal",
          },
          { id: "66666666-6666-4666-8666-666666666666", type: "ParagraphBlock", props: {} },
        ],
      },
    ];
    const entry = entryFromRow(row({ blocks, properties: {} }));
    const ids = entry.blocks.map((b) => b["id"]);
    expect(ids).toEqual([
      ...guide.content.blocks.map((b: any) => b.id),
      "44444444-4444-4444-8444-444444444444",
    ]);
    const section = entry.blocks.find((b) => b["id"] === "44444444-4444-4444-8444-444444444444");
    expect(section?.children?.map((b) => b["id"])).toEqual([
      "66666666-6666-4666-8666-666666666666",
    ]);
  });
});

describe("mentions", () => {
  const mention = (entryId: string, extra: Record<string, unknown> = {}) => ({
    type: "mention",
    entryId,
    collection: "doc",
    slug: "stored-slug",
    title: "Stored title",
    ...extra,
  });
  const paragraph = (...inline: unknown[]) => ({
    id: "77777777-7777-4777-8777-777777777777",
    type: "ParagraphBlock",
    props: { text: inline },
  });

  it("collects only valid entry ids, from blocks and properties", () => {
    const ids = mentionIds([
      {
        blocks: [paragraph(mention(TARGET_PUBLIC), mention("not-a-uuid"))],
        properties: { related: [mention(TARGET_INTERNAL)] },
      },
    ]);
    expect(new Set(ids)).toEqual(new Set([TARGET_PUBLIC, TARGET_INTERNAL]));
  });

  it("fills a Public published target with its current title, slug, colour and href", () => {
    const targets = new Map<string, MentionTarget>([
      [
        TARGET_PUBLIC,
        {
          collection: "doc",
          slug: "/docs/renamed",
          title: { en: "Current title" },
          public: true,
        },
      ],
    ]);
    const collections = new Map<string, CollectionInfo>([
      ["doc", { color: "#123456", features: { routable: "/{collection}/{slug}" } }],
    ]);
    const [out] = fillMentions(
      [{ blocks: [paragraph(mention(TARGET_PUBLIC))], properties: {} }],
      targets,
      collections,
    );
    const m = (out!.blocks[0] as any).props.text[0];
    expect(m.slug).toBe("docs/renamed");
    expect(m.title).toBe("Current title");
    expect(m.color).toBe("#123456");
    expect(m.href).toBe("/doc/docs/renamed");
  });

  it("gives a target that is not Public no href and keeps its stored title", () => {
    const targets = new Map<string, MentionTarget>([
      [
        TARGET_INTERNAL,
        { collection: "doc", slug: "secret-page", title: { en: "Secret" }, public: false },
      ],
    ]);
    const [out] = fillMentions(
      [{ blocks: [paragraph(mention(TARGET_INTERNAL))], properties: {} }],
      targets,
      new Map(),
    );
    const m = (out!.blocks[0] as any).props.text[0];
    expect(m.href).toBeUndefined();
    expect(m.title).toBe("Stored title");
    expect(m.slug).toBe("stored-slug");
  });

  it("fills an unknown target with its stored snapshot and a derived colour, and no href", () => {
    const [out] = fillMentions(
      [{ blocks: [paragraph(mention(TARGET_UNKNOWN))], properties: {} }],
      new Map(),
      new Map(),
    );
    const m = (out!.blocks[0] as any).props.text[0];
    expect(m.href).toBeUndefined();
    expect(m.title).toBe("Stored title");
    expect(m.color).toBe(collectionColor("doc"));
  });
});

describe("entryHref, collectionColor and resolveLabel", () => {
  it("builds the href from a string pattern, and the default path otherwise", () => {
    expect(entryHref("/{collection}/{slug}", { slug: "a", collection: "doc" })).toBe("/doc/a");
    expect(entryHref(true, { slug: "a", collection: "doc" })).toBe("/doc/a");
  });

  it("uses an explicit colour, and otherwise a stable palette colour", () => {
    expect(collectionColor("doc", "#abcdef")).toBe("#abcdef");
    expect(collectionColor("doc")).toBe(collectionColor("doc"));
    expect(collectionColor("doc")).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("resolves a label in the locale, then en, then any value", () => {
    expect(resolveLabel({ en: "Hi", fr: "Salut" }, "fr")).toBe("Salut");
    expect(resolveLabel({ en: "Hi", fr: "Salut" }, "de")).toBe("Hi");
    expect(resolveLabel({ fr: "Salut" }, "de")).toBe("Salut");
    expect(resolveLabel("Plain")).toBe("Plain");
    expect(resolveLabel(undefined)).toBe("");
  });
});

describe("termView and bylineView", () => {
  it("maps a term row with its public count", () => {
    const term = termView({
      id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      taxonomy: "category",
      slug: "news",
      label: '{"en":"News"}',
      description: null,
      parent_id: null,
      display_order: 2,
      count: 3,
      created_at: new Date("2026-11-01T00:00:00Z"),
      updated_at: null,
    });
    expect(term).toMatchObject({
      taxonomy: "category",
      slug: "news",
      label: { en: "News" },
      name: "News",
      description: null,
      parentId: null,
      displayOrder: 2,
      count: 3,
      postCount: 3,
      createdAt: "2026-11-01T00:00:00.000Z",
      updatedAt: null,
    });
  });

  it("maps a byline row to the camelCase byline shape", () => {
    const byline = bylineView({
      id: "ffffffff-ffff-4fff-8fff-ffffffffffff",
      name: "Ada",
      slug: "ada",
      website_url: null,
      bio: "Writer",
      avatar: null,
      user_id: null,
      socials: {},
      metadata: {},
      is_guest: "f",
      fields: {},
      created_at: null,
      updated_at: null,
      deleted_at: null,
    });
    expect(byline).toMatchObject({
      name: "Ada",
      slug: "ada",
      websiteUrl: null,
      isGuest: false,
      deletedAt: null,
    });
  });
});

describe("cacheControl", () => {
  it("matches the CMS delivery headers", () => {
    expect(cacheControl(60)).toBe("public, max-age=60, s-maxage=300, stale-while-revalidate=86400");
    expect(cacheControl(300)).toBe(
      "public, max-age=300, s-maxage=1500, stale-while-revalidate=86400",
    );
  });
});

describe("role-restricted blocks for signed-in website readers (owner, 2026-11-23)", () => {
  const blocks = [
    { id: "a1111111-1111-4111-8111-111111111111", type: "ParagraphBlock", props: {} },
    {
      id: "b2222222-2222-4222-8222-222222222222",
      type: "ParagraphBlock",
      props: {},
      allowedRoles: ["member"],
    },
    {
      id: "c3333333-3333-4333-8333-333333333333",
      type: "ParagraphBlock",
      props: {},
      allowedRoles: ["patron"],
    },
    {
      id: "d4444444-4444-4444-8444-444444444444",
      type: "ParagraphBlock",
      props: {},
      allowedRoles: ["member"],
      visibility: "internal",
    },
  ];
  const ids = (roles: string[]) =>
    entryFromRow(row({ blocks, properties: {} }), [], true, roles).blocks.map((b) => b["id"]);

  it("gives anonymous readers no roles, and signed-in readers theirs or member", () => {
    expect(readerRolesFor(null)).toEqual([]);
    expect(readerRolesFor({ roles: [] })).toEqual(["member"]);
    expect(readerRolesFor({ roles: ["patron", 3, ""] })).toEqual(["patron"]);
  });

  it("shows a block to a reader with one of its roles, never an internal one", () => {
    expect(ids([])).toEqual(["a1111111-1111-4111-8111-111111111111"]);
    expect(ids(["member"])).toEqual([
      "a1111111-1111-4111-8111-111111111111",
      "b2222222-2222-4222-8222-222222222222",
    ]);
    expect(ids(["patron"])).toEqual([
      "a1111111-1111-4111-8111-111111111111",
      "c3333333-3333-4333-8333-333333333333",
    ]);
  });

  it("keeps role-filtered responses out of shared caches", () => {
    expect(cacheControlFor([])).toBe(cacheControl(60));
    expect(cacheControlFor(["member"])).toBe("private, no-store");
  });
});
