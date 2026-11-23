import { readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import {
  catchUp,
  exportPage,
  forkDraft,
  importPage,
  mergeDraft,
  normalizePage,
} from "../src/space/content/collab/index.ts";

const fixturesDir = `${resolve(dirname(fileURLToPath(import.meta.url)), "fixtures/content")}/`;
const fixtureFiles = readdirSync(fixturesDir).filter((name) => name.endsWith(".page.json"));

function readFixture(name: string): any {
  return JSON.parse(readFileSync(`${fixturesDir}${name}`, "utf8"));
}

function basePage(): any {
  return {
    meta: { slug: "home", type: "page", title: { en: "Home" } },
    content: {
      blocks: [
        {
          id: "00000000-0000-4000-8000-000000000001",
          type: "ParagraphBlock",
          props: { text: [{ type: "text", text: "Hello", marks: ["bold"] }] },
        },
      ],
      properties: {},
    },
  };
}

describe("collab: fixtures", () => {
  it("finds the page fixtures", () => {
    expect(fixtureFiles.length).toBeGreaterThan(0);
  });

  for (const name of fixtureFiles) {
    it(`round-trips ${name}`, () => {
      const x = readFixture(name);
      expect(normalizePage(x)).toEqual(x);
      expect(exportPage(importPage(x))).toEqual(normalizePage(x));
    });
  }
});

describe("collab: normal form", () => {
  it("merges adjacent equal text, drops empty nodes, and keeps unknown blocks", () => {
    const x = {
      meta: { slug: "p", type: "page", title: { en: "P", pt: "P" } },
      content: {
        blocks: [
          {
            id: "b1",
            type: "ParagraphBlock",
            props: {
              text: [
                { type: "text", text: "a", marks: ["italic", "bold"] },
                { type: "text", text: "" },
                { type: "text", text: "b", marks: ["bold", "italic"] },
                {
                  type: "mention",
                  entryId: "e",
                  collection: "c",
                  slug: "s",
                  color: "red",
                  href: "/x",
                },
                { type: "mention", entryId: "e", collection: "c", slug: "s", color: "blue" },
              ],
            },
          },
          { id: "b2", type: "SomethingNew", props: { anything: { nested: true } }, children: [] },
        ],
        properties: { featured: true },
      },
    };
    const normal = normalizePage(x);
    expect(normal.content.blocks[0]?.props.text).toEqual([
      { type: "text", text: "ab", marks: ["bold", "italic"] },
      { type: "mention", entryId: "e", collection: "c", slug: "s" },
    ]);
    expect(normal.content.blocks[1]).toEqual({
      id: "b2",
      type: "SomethingNew",
      props: { anything: { nested: true } },
    });
    expect(exportPage(importPage(x))).toEqual(normal);
  });

  it("stores an invalid rich prop as plain JSON and keeps {} as a plain value", () => {
    const x = {
      meta: { slug: "p", type: "page", title: { en: "P" } },
      content: {
        blocks: [{ id: "b1", type: "ParagraphBlock", props: { text: { nope: 1 } } }],
        properties: { empty: {} },
      },
    };
    expect(exportPage(importPage(x))).toEqual(normalizePage(x));
  });
});

describe("collab: drafts", () => {
  it("edits a draft and merges it into main", () => {
    const main = importPage(basePage());
    const draft = forkDraft(main);
    draft.getMap("meta").set("slug", "draft-slug");
    draft.commit();
    expect(exportPage(main).meta["slug"]).toBe("home");
    mergeDraft(main, draft);
    expect(exportPage(main).meta["slug"]).toBe("draft-slug");
  });

  it("merges two concurrent drafts", () => {
    const main = importPage(basePage());
    const a = forkDraft(main);
    const b = forkDraft(main);
    a.getMap("meta").set("templateVersion", 2);
    a.commit();
    b.getMap("meta").set("tags", [{ en: "news" }]);
    b.commit();
    mergeDraft(main, a);
    mergeDraft(main, b);
    const out = exportPage(main);
    expect(out.meta["templateVersion"]).toBe(2);
    expect(out.meta["tags"]).toEqual([{ en: "news" }]);
  });

  it("catches a draft up with main", () => {
    const main = importPage(basePage());
    const draft = forkDraft(main);
    main.getMap("meta").set("templateVersion", 7);
    main.commit();
    catchUp(draft, main);
    expect(exportPage(draft)).toEqual(exportPage(main));
    expect(exportPage(draft).meta["templateVersion"]).toBe(7);
  });
});
