import { describe, expect, it } from "vite-plus/test";
import { cloneBlock, findBlock, insertBlock, moveBlock, normalizeBlocks, removeBlock } from "../src/core/blocks/tree";
import { BlockRegistry } from "../src/core/blocks/registry";
import { builtinBlocks } from "../src/core/blocks/builtins";
import { resolveCollection } from "../src/core/collections/define";
import { validateProperties } from "../src/core/collections/validate";
import { normalizeLegacyBlocks, parseFieldSchema } from "../src/migrator/legacy";
import { inlineToHtml, toInlineNodes } from "../src/editor/inline";
import type { BaseBlock } from "../src/core/types/blocks";

const p = (id: string): BaseBlock => ({ id, type: "ParagraphBlock", props: {} });
const s = (id: string, children: BaseBlock[] = []): BaseBlock => ({ id, type: "SectionBlock", props: { title: id }, children });

describe("block tree", () => {
  it("sanitizes untrusted input: drops junk, fixes missing/duplicate ids", () => {
    const tree = normalizeBlocks([s("s", [p("a")]), { id: "a", type: "ParagraphBlock" }, null, { foo: 1 }]);
    expect(tree).toHaveLength(2);
    expect(tree[1]!.id).not.toBe("a");
    expect(tree[1]!.props).toEqual({});
  });

  it("inserts, moves (including into containers) and removes immutably", () => {
    const tree = [s("s1", [p("a")]), p("b")];
    const moved = moveBlock(tree, "b", "s1", 0);
    expect(moved[0]!.children!.map((b) => b.id)).toEqual(["b", "a"]);
    expect(tree[0]!.children).toHaveLength(1); // untouched
    expect(moveBlock(tree, "s1", "a", 0)).toBe(tree); // can't move into own descendant
    expect(removeBlock(moved, "a")[0]!.children!.map((b) => b.id)).toEqual(["b"]);
    expect(insertBlock(tree, p("c"), null, 1).map((b) => b.id)).toEqual(["s1", "c", "b"]);
  });

  it("moves down within the same parent to the intended slot", () => {
    const tree = [p("a"), p("b"), p("c")];
    expect(moveBlock(tree, "a", null, 2).map((b) => b.id)).toEqual(["b", "a", "c"]);
  });

  it("clones with fresh ids at every depth", () => {
    const copy = cloneBlock(s("s", [p("x")]));
    expect(copy.id).not.toBe("s");
    expect(copy.children![0]!.id).not.toBe("x");
    expect(findBlock([copy], copy.children![0]!.id)?.parent?.id).toBe(copy.id);
  });
});

describe("block registry", () => {
  const registry = new BlockRegistry().register(...builtinBlocks);
  it("enforces allowed children", () => {
    expect(registry.allowedChildren("TabsBlock").map((d) => d.type)).toEqual(["TabItemBlock"]);
    expect(registry.allowedChildren(null).some((d) => d.type === "TabItemBlock")).toBe(false);
    expect(registry.allowedChildren("SectionBlock").some((d) => d.type === "ParagraphBlock")).toBe(true);
  });
  it("creates blocks with defaults and initial children", () => {
    const tabs = registry.create("TabsBlock");
    expect(tabs.children?.[0]?.type).toBe("TabItemBlock");
  });
});

describe("collections", () => {
  const c = resolveCollection({
    slug: "product",
    label: "Product",
    fields: {
      price: { type: "currency", label: "Price", required: true },
      size: { type: "select", label: "Size", options: [{ value: "s", label: "S" }] },
      name: { type: "text", label: "Name", translatable: true, max: 5 },
    },
  });
  it("validates field values", () => {
    expect(validateProperties(c, {})).toHaveLength(1);
    expect(validateProperties(c, {}, { partial: true })).toHaveLength(0);
    expect(validateProperties(c, { price: { amount: 100, currency: "USD" }, size: "s", name: { en: "ok" } })).toHaveLength(0);
    expect(validateProperties(c, { price: { amount: 100 }, size: "xl" }).map((e) => e.field)).toEqual(["size"]);
    expect(validateProperties(c, { price: { amount: 1 }, name: { en: "too long" } }).map((e) => e.field)).toEqual(["name"]);
  });
  it("migration converters handle legacy field schemas and block trees", () => {
    const blocks = normalizeLegacyBlocks([
      { id: "h", type: "HeadingBlock", props: { level: 2, text: "Intro" } },
      { id: "x", type: "ParagraphBlock", props: { content: "body" } },
    ]);
    expect(blocks[0]).toMatchObject({ type: "SectionBlock", props: { title: "Intro" } });
    expect(blocks[1]!.props["text"]).toEqual([{ type: "text", text: "body" }]);
    expect(parseFieldSchema({ fields: { a: { type: "text", label: "A" } }, groups: {} }).fields["a"]?.type).toBe("text");
    expect(parseFieldSchema({ g: { label: "G", fields: { a: { type: "page-array", label: "A" } } } }).fields["a"]?.type).toBe("references");
  });
});

describe("inline text", () => {
  it("only accepts inline node arrays", () => {
    expect(toInlineNodes("hi")).toEqual([]);
    expect(toInlineNodes([{ type: "text", text: "a" }])).toHaveLength(1);
  });
  it("renders marks and escapes html", () => {
    expect(inlineToHtml([{ type: "text", text: "<b>", marks: ["bold"] }])).toBe("<strong>&lt;b&gt;</strong>");
  });
});
