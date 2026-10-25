import { beforeEach, describe, expect, it } from "vite-plus/test";
import { drizzle } from "drizzle-orm/d1";
import { migrateCms } from "../src/migrator/index";
import { createCms, type Cms } from "../src/services/index";
import { CmsError, type CmsActor } from "../src/services/context";
import { defineCollection } from "../src/core/collections/define";
import { handleCmsCron } from "../src/cron/scheduled";
import { createMockD1 } from "./helpers/d1";

const admin: CmsActor = { userId: "admin-1", name: "Ada", roles: ["admin"], permissions: [] };
const editor: CmsActor = { userId: "editor-1", name: "Eve", roles: ["editor"], permissions: [] };
const reviewer: CmsActor = { userId: "rev-1", name: "Rae", roles: ["reviewer"], permissions: [] };

const products = defineCollection({
  slug: "product",
  label: "Product",
  kind: "data",
  features: { ecommerce: { currency: "USD" }, blocks: false },
  fields: {
    price: { type: "currency", label: "Price", required: true },
    stock: { type: "number", label: "Stock", min: 0 },
    size: {
      type: "select",
      label: "Size",
      options: [
        { value: "s", label: "S" },
        { value: "m", label: "M" },
      ],
    },
  },
});

const handbook = defineCollection({
  slug: "handbook",
  label: "Handbook page",
  features: { hierarchical: true },
  workflow: { minApprovals: 1, allowSelfApproval: false },
});

let cms: Cms;
let binding: any;

beforeEach(async () => {
  ({ binding } = createMockD1());
  await migrateCms(binding);
  cms = createCms({ db: drizzle(binding), dialect: "sqlite", collections: [products, handbook] });
});

const text = (t: string) => [
  { id: crypto.randomUUID(), type: "ParagraphBlock", props: { text: [{ type: "text", text: t }] } },
];

async function expectError(p: Promise<unknown>, status: number) {
  try {
    await p;
  } catch (err) {
    expect(err).toBeInstanceOf(CmsError);
    expect((err as CmsError).status).toBe(status);
    return err as CmsError;
  }
  throw new Error(`expected CmsError ${status}`);
}

describe("collections", () => {
  it("merges built-in, code and database collections", async () => {
    await cms.collections.createCollection(admin, {
      slug: "recipe",
      label: "Recipe",
      fields: { serves: { type: "number", label: "Serves" } },
    });
    const slugs = (await cms.collections.listCollections()).map((c: any) => [c.slug, c.source]);
    expect(slugs).toContainEqual(["blog", "code"]);
    expect(slugs).toContainEqual(["product", "code"]);
    expect(slugs).toContainEqual(["recipe", "database"]);
  });

  it("only lets admins edit schemas, and DB overrides win over code", async () => {
    await expectError(cms.collections.createCollection(editor, { slug: "x", label: "X" }), 403);
    await cms.collections.updateCollection(admin, "blog", { label: "Articles" });
    expect((await cms.collections.getCollection("blog")).label).toEqual({ en: "Articles" });
    await cms.collections.deleteCollection(admin, "blog");
    expect((await cms.collections.getCollection("blog")).source).toBe("code");
  });
});

describe("entry lifecycle", () => {
  it("creates drafts that readers cannot see until published", async () => {
    const entry = await cms.entries.createEntry(editor, {
      collection: "blog",
      title: "Hello World",
      blocks: text("draft"),
    });
    expect(entry.slug).toBe("hello-world");
    expect(entry.status).toBe("draft");
    expect((await cms.entries.listEntries({ status: "published" })).total).toBe(0);

    const published = await cms.entries.publishEntry(editor, entry.id, { changeSummary: "first" });
    expect(published.status).toBe("published");
    expect(published.publishedVersionId).toBeTruthy();
    expect(published.hasUnpublishedChanges).toBe(false);

    // Editing after publish keeps the live content until the next publish.
    await cms.entries.saveDraft(editor, entry.id, { blocks: text("v2") });
    const after = await cms.entries.getEntry(entry.id);
    expect(after.hasUnpublishedChanges).toBe(true);
    expect(JSON.stringify(after.published.blocks)).toContain("draft");
    expect(JSON.stringify(after.draft.blocks)).toContain("v2");

    const versions = await cms.entries.listVersions(entry.id);
    expect(versions).toHaveLength(1);
    const diff = await cms.entries.diffEntry(entry.id);
    expect(
      diff.summary.addedCount + diff.summary.removedCount + diff.summary.modifiedCount,
    ).toBeGreaterThan(0);
  });

  it("rejects duplicate slugs and nested slugs in flat collections", async () => {
    await cms.entries.createEntry(editor, { collection: "blog", title: "Same" });
    await expectError(cms.entries.createEntry(editor, { collection: "blog", title: "Same" }), 409);
    await expectError(
      cms.entries.createEntry(editor, { collection: "blog", title: "x", slug: "a/b" }),
      422,
    );
    const doc = await cms.entries.createEntry(editor, {
      collection: "doc",
      title: "Setup",
      slug: "guides/setup",
    });
    expect(doc.slug).toBe("guides/setup");
  });

  it("validates typed properties (commerce)", async () => {
    await expectError(
      cms.entries.createEntry(admin, {
        collection: "product",
        title: "Shirt",
        properties: { price: 10 },
      }),
      422,
    );
    const shirt = await cms.entries.createEntry(admin, {
      collection: "product",
      title: "Shirt",
      properties: { price: { amount: 1999, currency: "USD" }, stock: 3, size: "m" },
    });
    await expectError(
      cms.entries.saveDraft(admin, shirt.id, {
        properties: { ...shirt.draft.properties, size: "xl" },
      }),
      422,
    );
  });

  it("enforces block nesting rules", async () => {
    const e = await cms.entries.createEntry(editor, { collection: "blog", title: "Nest" });
    await expectError(
      cms.entries.saveDraft(editor, e.id, {
        blocks: [{ id: crypto.randomUUID(), type: "TabItemBlock", props: { label: "x" } }],
      }),
      422,
    );
  });

  it("soft-deletes, frees the slug from listings, and restores", async () => {
    const e = await cms.entries.createEntry(editor, { collection: "blog", title: "Trash me" });
    await cms.entries.deleteEntry(editor, e.id);
    expect((await cms.entries.listEntries({ collection: "blog" })).total).toBe(0);
    const restored = await cms.entries.restoreEntry(editor, e.id);
    expect(restored.deletedAt).toBeNull();
    expect(restored.status).toBe("draft");
  });
});

describe("locks", () => {
  it("blocks other users' saves while a lock is held; admins can take over", async () => {
    const e = await cms.entries.createEntry(editor, { collection: "blog", title: "Locked" });
    expect((await cms.entries.acquireLock(editor, e.id)).ownedByActor).toBe(true);
    const other = await cms.entries.acquireLock(reviewer, e.id);
    expect(other.ownedByActor).toBe(false);
    await expectError(cms.entries.saveDraft(reviewer, e.id, { blocks: text("x") }), 409);
    expect((await cms.entries.acquireLock(admin, e.id, { force: true })).ownedByActor).toBe(true);
  });
});

describe("review workflow", () => {
  it("requires an approval from someone other than the author", async () => {
    const e = await cms.entries.createEntry(editor, {
      collection: "handbook",
      title: "Policy",
      blocks: text("rules"),
    });
    await expectError(cms.entries.publishEntry(editor, e.id), 403);

    const version = await cms.entries.requestReview(editor, e.id, "please review");
    expect(version.status).toBe("pending");
    await expectError(cms.entries.approveVersion(editor, version.id), 403); // self-approval off

    const approved = await cms.entries.approveVersion(reviewer, version.id);
    expect(approved.status).toBe("approved");
    expect((await cms.entries.reviewQueue()).map((v: any) => v.id)).toContain(version.id);

    const live = await cms.entries.publishEntry(editor, e.id, { versionId: version.id });
    expect(live.status).toBe("published");
    expect(live.publishedVersionId).toBe(version.id);
  });

  it("supports rejection with a comment and rollback into the draft", async () => {
    const e = await cms.entries.createEntry(admin, {
      collection: "blog",
      title: "Roll",
      blocks: text("one"),
    });
    await cms.entries.publishEntry(admin, e.id);
    await cms.entries.saveDraft(admin, e.id, { blocks: text("two") });
    const [v1] = await cms.entries.listVersions(e.id);
    expect(v1).toBeDefined();
    const rolled = await cms.entries.rollbackToVersion(admin, v1!.id);
    expect(JSON.stringify(rolled.draft.blocks)).toContain("one");

    const pending = await cms.entries.requestReview(admin, e.id);
    const rejected = await cms.entries.rejectVersion(admin, pending.id, "needs work");
    expect(rejected.status).toBe("rejected");
    expect((await cms.entries.listComments(pending.id))[0]?.content).toBe("needs work");
  });
});

describe("scheduling", () => {
  it("publishes due entries from the cron handler", async () => {
    const e = await cms.entries.createEntry(admin, {
      collection: "blog",
      title: "Later",
      blocks: text("soon"),
    });
    const at = new Date(Date.now() + 60 * 60 * 1000);
    const scheduled = await cms.entries.scheduleEntry(admin, e.id, at);
    expect(scheduled.status).toBe("scheduled");

    const early = await handleCmsCron({ db: binding, now: new Date() });
    expect(early.published).toEqual([]);

    const later = await handleCmsCron({ db: binding, now: new Date(at.getTime() + 1000) });
    expect(later.published).toEqual([e.id]);
    expect((await cms.entries.getEntry(e.id)).status).toBe("published");
  });
});

describe("taxonomies, bylines, search, templates", () => {
  it("assigns terms and filters entries by term", async () => {
    const term = await cms.taxonomies.createTerm(admin, "category", { label: "News" });
    const e = await cms.entries.createEntry(admin, { collection: "blog", title: "Tagged" });
    await cms.entries.publishEntry(admin, e.id);
    await cms.taxonomies.setEntryTerms(admin, e.id, "category", [term.id]);
    const terms = await cms.taxonomies.listTerms("category");
    expect(terms[0]?.count).toBe(1);
    const filtered = await cms.entries.listEntries({
      taxonomy: { taxonomy: "category", term: "news" },
    });
    expect(filtered.entries.map((x: any) => x.id)).toEqual([e.id]);
    await expectError(cms.taxonomies.createTerm(admin, "nope", { label: "x" }), 404);
  });

  it("manages bylines", async () => {
    const b = await cms.bylines.createByline(admin, { name: "Jane Doe" });
    expect(b.slug).toBe("jane-doe");
    expect((await cms.bylines.getByline("jane-doe")).id).toBe(b.id);
    await cms.bylines.deleteByline(admin, b.id);
    expect(await cms.bylines.listBylines()).toHaveLength(0);
  });

  it("indexes published entries and finds them (SQLite fallback)", async () => {
    const e = await cms.entries.createEntry(admin, {
      collection: "wiki",
      title: "Dragons",
      blocks: text("Fire-breathing lizards"),
    });
    await cms.entries.publishEntry(admin, e.id);
    const hits = await cms.search.searchEntries("lizards");
    expect(hits[0]?.sourceId).toBe(e.id);
    expect(hits[0]?.url).toBe("/wiki/dragons");
    await cms.entries.unpublishEntry(admin, e.id);
    expect(await cms.search.searchEntries("lizards")).toHaveLength(0);
  });

  it("creates entries from templates, honouring create permissions", async () => {
    const tpl = await cms.templates.createTemplate(admin, {
      title: "Patch notes",
      collection: "blog",
      rolePermissions: { whoCanCreate: ["admin"] },
      initialBlocks: [
        {
          id: crypto.randomUUID(),
          type: "SectionBlock",
          props: { title: "Highlights" },
          children: [],
          isTemplated: true,
        },
      ],
    });
    await expectError(
      cms.entries.createEntry(editor, { collection: "blog", title: "1.0", templateId: tpl.id }),
      403,
    );
    const e = await cms.entries.createEntry(admin, {
      collection: "blog",
      title: "1.0",
      templateId: tpl.id,
    });
    expect(e.draft.blocks[0]?.type).toBe("SectionBlock");
    expect(e.draft.blocks[0]?.id).not.toBe(tpl.initialBlocks[0]?.id);

    // Templated blocks cannot be removed by a draft save.
    await expectError(cms.entries.saveDraft(admin, e.id, { blocks: [] }), 403);
  });
});
