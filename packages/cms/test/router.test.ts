import { beforeEach, describe, expect, it } from "vite-plus/test";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { migrateCms } from "../src/migrator/index";
import { createCms, type Cms, type CmsActor } from "../src/services/index";
import { createCmsApi } from "../src/server/router";
import { createMockD1 } from "./helpers/d1";

const admin: CmsActor = { userId: "admin-1", name: "Ada", roles: ["admin"], permissions: [] };

let cms: Cms;
let app: ReturnType<typeof createCmsApi>;

beforeEach(async () => {
  const { binding } = createMockD1();
  await migrateCms(binding);
  cms = createCms({ db: drizzle(binding), dialect: "sqlite" });
  app = createCmsApi({ db: drizzle(binding) });
  // Nothing is built in: scaffold the collections these tests write to from presets.
  for (const preset of ["blog", "page"])
    await cms.collections.createCollectionFromPreset(admin, preset);
});

const get = (path: string) => app.request(path, { method: "GET" });

/** Creates a published entry; `visibility` is set directly, as Space does, since services leave it Internal. */
async function publish(
  collection: string,
  title: string,
  blocks: unknown[],
  visibility: "Public" | "Internal",
): Promise<string> {
  const entry = await cms.entries.createEntry(admin, { collection, title });
  await cms.entries.saveDraft(admin, entry.id, { blocks } as any);
  await cms.entries.publishEntry(admin, entry.id);
  const { pages } = cms.ctx.t;
  await cms.ctx.db.update(pages).set({ visibility }).where(eq(pages.id, entry.id));
  return entry.id;
}

const paragraph = (text: string, extra: Record<string, unknown> = {}) => ({
  id: crypto.randomUUID(),
  type: "ParagraphBlock",
  props: { text: [{ type: "text", text }] },
  ...extra,
});

describe("public delivery: page visibility", () => {
  it("serves only Public pages from collection lists and single pages", async () => {
    await publish("blog", "Public launch", [paragraph("open")], "Public");
    await publish("blog", "Internal launch", [paragraph("secret")], "Internal");

    const list = (await (await get("/content/collections/blog")).json()) as any;
    expect(list.total).toBe(1);
    expect(list.entries.map((e: any) => e.slug)).toEqual(["public-launch"]);

    expect((await get("/content/collections/blog/internal-launch")).status).toBe(404);
    expect((await get("/content/collections/blog/internal-launch.md")).status).toBe(404);
    expect((await get("/content/collections/blog/public-launch")).status).toBe(200);
  });

  it("keeps Internal pages out of search", async () => {
    await publish("blog", "Quarterly roadmap", [paragraph("roadmap text")], "Internal");
    const hits = (await (await get("/search?q=roadmap")).json()) as any[];
    expect(hits).toEqual([]);
  });
});

describe("public delivery: block visibility", () => {
  it("drops internal blocks, including nested children, for every reader", async () => {
    const section = {
      id: crypto.randomUUID(),
      type: "SectionBlock",
      props: {},
      children: [paragraph("kept inside"), paragraph("hidden inside", { visibility: "internal" })],
    };
    await publish(
      "page",
      "Mixed",
      [
        paragraph("public"),
        paragraph("hidden", { visibility: "internal" }),
        paragraph("staff", { allowedRoles: ["employee"] }),
        section,
      ],
      "Public",
    );

    const { entry } = (await (await get("/content/collections/page/mixed")).json()) as any;
    expect(entry.blocks.map((b: any) => b.type)).toEqual(["ParagraphBlock", "SectionBlock"]);
    expect(entry.blocks[0].props.text[0].text).toBe("public");
    expect(entry.blocks[1].children).toHaveLength(1);
    expect(entry.blocks[1].children[0].props.text[0].text).toBe("kept inside");
  });
});
