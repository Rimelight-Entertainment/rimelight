import { describe, expect, it } from "vite-plus/test";
import {
  draftRolesFor,
  parseDraftListQuery,
  selectDrafts,
} from "../src/space/content/content-drafts-logic.ts";
import {
  escapeLike,
  mentionLimit,
  mentionPattern,
  normaliseMentionQuery,
} from "../src/space/content/content-mentions-logic.ts";
import {
  freshBlockIds,
  templateContent,
  templateIdField,
} from "../src/space/content/content-templates-logic.ts";
import { collectionListItem } from "../src/space/content/content-collections-logic.ts";

const ME = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const MEMBER = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

type Draft = {
  id: string;
  authorId: string;
  memberIds: string[];
  status: string;
  scope: string;
};

const draft = (over: Partial<Draft> & { id: string }): Draft => ({
  authorId: OTHER,
  memberIds: [],
  status: "Open",
  scope: "p1",
  ...over,
});

describe("parseDraftListQuery", () => {
  it("defaults to both statuses and all three roles", () => {
    expect(parseDraftListQuery(undefined, undefined)).toEqual({
      ok: true,
      statuses: ["Open", "InReview"],
      roles: ["mine", "member", "reviewer"],
    });
  });

  it("takes one status and one role when given", () => {
    expect(parseDraftListQuery("InReview", "reviewer")).toEqual({
      ok: true,
      statuses: ["InReview"],
      roles: ["reviewer"],
    });
  });

  it("treats an empty param as absent", () => {
    expect(parseDraftListQuery("", "")).toMatchObject({
      ok: true,
      roles: ["mine", "member", "reviewer"],
    });
  });

  it("refuses unknown values", () => {
    expect(parseDraftListQuery("Published", undefined).ok).toBe(false);
    expect(parseDraftListQuery(undefined, "author").ok).toBe(false);
  });
});

describe("draftRolesFor", () => {
  it("gives mine to the author and member to an invited person", () => {
    expect(draftRolesFor(draft({ id: "d", authorId: ME }), ME, "edit")).toEqual(["mine"]);
    expect(draftRolesFor(draft({ id: "d", memberIds: [ME] }), ME, "edit")).toEqual(["member"]);
  });

  it("gives reviewer only for an InReview draft on a page the caller manages", () => {
    const inReview = draft({ id: "d", status: "InReview" });
    expect(draftRolesFor(inReview, ME, "manage")).toEqual(["reviewer"]);
    expect(draftRolesFor(inReview, ME, "edit")).toEqual([]);
    expect(draftRolesFor(draft({ id: "d", status: "Open" }), ME, "manage")).toEqual([]);
  });

  it("gives no roles when the caller cannot view the page", () => {
    expect(draftRolesFor(draft({ id: "d", authorId: ME, status: "InReview" }), ME, "none")).toEqual(
      [],
    );
  });

  it("lists every matching role in order", () => {
    const d = draft({ id: "d", authorId: ME, status: "InReview" });
    expect(draftRolesFor(d, ME, "manage")).toEqual(["mine", "reviewer"]);
  });
});

describe("selectDrafts", () => {
  const all = { statuses: ["Open", "InReview"], roles: ["mine", "member", "reviewer"] as const };
  const levels: Record<string, "none" | "view" | "edit" | "manage"> = {
    p1: "edit",
    p2: "manage",
    p3: "none",
  };
  const levelOf = (d: Draft) => levels[d.scope] ?? "none";

  it("lists a draft once, with every role it matched", () => {
    const list = [
      draft({ id: "a", authorId: ME, memberIds: [ME], status: "InReview", scope: "p2" }),
    ];
    const out = selectDrafts(list, ME, all, levelOf);
    expect(out).toHaveLength(1);
    expect(out[0]!.roles).toEqual(["mine", "member", "reviewer"]);
  });

  it("filters by the requested role", () => {
    const list = [
      draft({ id: "mine", authorId: ME }),
      draft({ id: "member", memberIds: [ME] }),
      draft({ id: "review", status: "InReview", scope: "p2" }),
    ];
    const ids = (role: "mine" | "member" | "reviewer") =>
      selectDrafts(list, ME, { ...all, roles: [role] }, levelOf).map((x) => x.draft.id);
    expect(ids("mine")).toEqual(["mine"]);
    expect(ids("member")).toEqual(["member"]);
    expect(ids("reviewer")).toEqual(["review"]);
  });

  it("filters by status", () => {
    const list = [
      draft({ id: "open" }),
      draft({ id: "review", status: "InReview", memberIds: [ME] }),
    ];
    const out = selectDrafts(list, ME, { ...all, statuses: ["InReview"] }, levelOf);
    expect(out.map((x) => x.draft.id)).toEqual(["review"]);
  });

  it("hides drafts on pages the caller cannot view", () => {
    const list = [draft({ id: "hidden", authorId: ME, scope: "p3" })];
    expect(selectDrafts(list, ME, all, levelOf)).toEqual([]);
  });

  it("skips drafts with no role for the caller", () => {
    const list = [draft({ id: "x", memberIds: [MEMBER] })];
    expect(selectDrafts(list, ME, all, levelOf)).toEqual([]);
  });
});

describe("mention query", () => {
  it("trims, collapses whitespace and caps the length", () => {
    expect(normaliseMentionQuery("  hello   big\tworld ")).toBe("hello big world");
    expect(normaliseMentionQuery("x".repeat(150))).toHaveLength(100);
    expect(normaliseMentionQuery("   ")).toBe("");
    expect(normaliseMentionQuery(undefined)).toBe("");
  });

  it("defaults and clamps the limit to 1 through 25", () => {
    expect(mentionLimit(undefined)).toBe(10);
    expect(mentionLimit("")).toBe(10);
    expect(mentionLimit("abc")).toBe(10);
    expect(mentionLimit("5")).toBe(5);
    expect(mentionLimit("99")).toBe(25);
    expect(mentionLimit("0")).toBe(1);
    expect(mentionLimit("-4")).toBe(1);
  });

  it("escapes LIKE wildcards so the search is literal", () => {
    expect(escapeLike("50%_off\\")).toBe("50\\%\\_off\\\\");
    expect(mentionPattern("a%b")).toBe("%a\\%b%");
  });
});

describe("freshBlockIds", () => {
  it("gives every block a new id, including nested children", () => {
    let n = 0;
    const next = () => `new-${++n}`;
    const blocks = [
      { id: "old-1", type: "Section", children: [{ id: "old-2", type: "Text", text: "hi" }] },
      { id: "old-3", type: "Image" },
    ];
    const out = freshBlockIds(blocks, next) as Array<{
      id: string;
      children?: Array<{ id: string; type: string; text?: string }>;
    }>;
    expect(out[0]!.id).toBe("new-1");
    expect(out[0]!.children![0]!.id).toBe("new-2");
    expect(out[1]!.id).toBe("new-3");
    expect(out[0]!.children![0]).toMatchObject({ type: "Text", text: "hi" });
  });

  it("does not change the input", () => {
    const blocks = [{ id: "keep", type: "Text" }];
    freshBlockIds(blocks, () => "fresh");
    expect(blocks[0]!.id).toBe("keep");
  });

  it("leaves values that are not blocks alone", () => {
    const out = freshBlockIds(
      { title: "x", count: 2, nested: { id: "no-type" } },
      () => "fresh",
    ) as Record<string, unknown>;
    expect(out).toEqual({ title: "x", count: 2, nested: { id: "no-type" } });
  });
});

describe("templateContent", () => {
  it("starts from the template's blocks with fresh ids and copies its default properties", () => {
    const defaults = { status: "draft", tags: ["a"] };
    const out = templateContent(
      { initialBlocks: [{ id: "t1", type: "Text" }], defaultProperties: defaults },
      () => "fresh-id",
    );
    expect(out.blocks).toEqual([{ id: "fresh-id", type: "Text" }]);
    expect(out.properties).toEqual(defaults);
    expect(out.properties).not.toBe(defaults);
  });

  it("gives an empty page when the template has no blocks or properties", () => {
    expect(templateContent({ initialBlocks: null, defaultProperties: null }, () => "x")).toEqual({
      blocks: [],
      properties: {},
    });
  });
});

describe("templateIdField", () => {
  it("accepts absent, null and a UUID (lower-cased)", () => {
    expect(templateIdField(undefined)).toEqual({ ok: true, id: null });
    expect(templateIdField(null)).toEqual({ ok: true, id: null });
    expect(templateIdField("ABCDEF01-2345-4678-8ABC-DEF012345678")).toEqual({
      ok: true,
      id: "abcdef01-2345-4678-8abc-def012345678",
    });
  });

  it("refuses anything else", () => {
    expect(templateIdField("not-a-uuid").ok).toBe(false);
    expect(templateIdField(42).ok).toBe(false);
  });
});

describe("collectionListItem", () => {
  const base = {
    slug: "blog",
    name: { en: "Post" },
    description: null,
    icon: "i-lucide-box",
    color: "#3b82f6",
    mode: "Standard",
    field_schema: { groups: {}, fields: { title: { type: "text" } } },
  };

  it("keeps the stored labelPlural, features and fields", () => {
    const item = collectionListItem({
      ...base,
      features: { labelPlural: "Posts", routable: "/blog/{slug}" },
    });
    expect(item.labelPlural).toBe("Posts");
    expect(item.features).toEqual({ labelPlural: "Posts", routable: "/blog/{slug}" });
    expect(item.fields).toEqual(base.field_schema);
    expect(item.routable).toBe("/blog/{slug}");
    expect(item.routablePath).toBe("/blog/{slug}");
    expect(item.color).toBe("#3b82f6");
    expect(item.icon).toBe("i-lucide-box");
  });

  it("falls back to the English label and to routable true", () => {
    const item = collectionListItem({ ...base, features: {} });
    expect(item.labelPlural).toBe("Post");
    expect(item.routable).toBe(true);
    expect(item.routablePath).toBeNull();
  });

  it("gives empty fields and features when the row has none", () => {
    const item = collectionListItem({ ...base, field_schema: null, features: null });
    expect(item.fields).toEqual({ groups: {}, fields: {} });
    expect(item.features).toEqual({});
  });
});
