import { describe, expect, it } from "vite-plus/test";
import { normalizeBlocks } from "../src/core/blocks/tree";

/**
 * Content written by a newer editor (or a plugin) must survive a round trip through this
 * editor: unknown block types and props are kept, localized values are kept, and only the
 * delivery-only mention fields are removed.
 */
describe("normalizeBlocks with content from a newer editor", () => {
  it("keeps unknown block types and their props and children", () => {
    const input = [
      {
        id: "future-1",
        type: "TimelineBlock",
        props: { events: [{ year: 1999, label: "x" }], theme: "dark" },
        children: [{ id: "future-2", type: "EventBlock", props: { label: "inner" } }],
        someNewField: { anything: true },
      },
    ];
    const [block] = normalizeBlocks(input);
    expect(block!.type).toBe("TimelineBlock");
    expect(block!.props).toEqual({ events: [{ year: 1999, label: "x" }], theme: "dark" });
    expect((block as any).someNewField).toEqual({ anything: true });
    expect(block!.children?.[0]).toMatchObject({ id: "future-2", type: "EventBlock" });
  });

  it("keeps localized rich text maps intact", () => {
    const input = [
      {
        id: "p1",
        type: "ParagraphBlock",
        props: {
          text: {
            en: [{ type: "text", text: "hi" }],
            pt: [{ type: "text", text: "oi" }],
            fr: [{ type: "text", text: "salut" }],
          },
        },
      },
    ];
    expect(normalizeBlocks(input)[0]!.props["text"]).toEqual({
      en: [{ type: "text", text: "hi" }],
      pt: [{ type: "text", text: "oi" }],
      fr: [{ type: "text", text: "salut" }],
    });
  });

  it("strips delivery-only mention fields wherever they appear", () => {
    const input = [
      {
        id: "p1",
        type: "ParagraphBlock",
        props: {
          text: [
            {
              type: "mention",
              entryId: "e",
              collection: "character",
              slug: "a",
              color: "#f00",
              href: "/a",
            },
          ],
        },
      },
    ];
    expect(normalizeBlocks(input)[0]!.props["text"]).toEqual([
      { type: "mention", entryId: "e", collection: "character", slug: "a" },
    ]);
  });

  it("gives every block a unique id, replacing duplicates and missing ids", () => {
    const input = [
      { id: "same", type: "ParagraphBlock", props: {} },
      { id: "same", type: "ParagraphBlock", props: {} },
      { type: "ParagraphBlock", props: {} },
    ];
    const ids = normalizeBlocks(input).map((b) => b.id);
    expect(new Set(ids).size).toBe(3);
    expect(ids[0]).toBe("same");
  });

  it("drops non-block entries instead of throwing", () => {
    const input = [null, 42, "text", { id: "ok", type: "ParagraphBlock", props: {} }];
    expect(normalizeBlocks(input as unknown[]).map((b) => b.id)).toEqual(["ok"]);
    expect(normalizeBlocks("not an array")).toEqual([]);
  });
});
