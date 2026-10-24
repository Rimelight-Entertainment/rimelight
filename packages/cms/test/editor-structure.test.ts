import { describe, expect, it } from "vite-plus/test";
import { cloneBlock, flattenBlocks } from "../src/core/blocks/tree";
import { BlockRegistry, defineBlock } from "../src/core/blocks/registry";
import { builtinBlocks } from "../src/core/blocks/builtins";
import { collectionColor } from "../src/core/collections/color";
import {
  isRichTextEmpty,
  resolveRichText,
  richTextToPlain,
  updateRichText,
} from "../src/core/richtext";
import { upgradeRichTextContent } from "../src/migrator/richtext";
import type { BaseBlock } from "../src/core/types/blocks";

const registry = new BlockRegistry().register(
  ...builtinBlocks,
  defineBlock({ type: "ScriptBlock", label: "Script", defaultProps: {}, children: ["SceneBlock"] }),
  defineBlock({ type: "SceneBlock", label: "Scene", defaultProps: {}, parents: ["ScriptBlock"] }),
);

describe("duplicate", () => {
  it("re-ids every block, including children and block trees inside props, and drops locks", () => {
    const original: BaseBlock = {
      id: "root",
      type: "TabsBlock",
      isTemplated: true,
      props: { media: { id: "media-1" }, nested: [{ id: "inner", type: "ParagraphBlock", props: {} }] },
      children: [{ id: "tab", type: "TabItemBlock", props: {}, children: [{ id: "p", type: "ParagraphBlock", props: {} }] }],
    };
    const copy = cloneBlock(original);
    const ids = [...flattenBlocks([copy]).map((b) => b.id), copy.props["nested"][0].id];
    expect(ids.some((id) => ["root", "tab", "p", "inner"].includes(id))).toBe(false);
    expect(new Set(ids).size).toBe(ids.length);
    expect(copy.props["media"].id).toBe("media-1"); // references to other records are kept
    expect(copy.isTemplated).toBeUndefined();
  });
});

describe("allowed parents", () => {
  it("only offers a block inside its declared parents", () => {
    expect(registry.accepts(null, "SceneBlock")).toBe(false);
    expect(registry.accepts("SectionBlock", "SceneBlock")).toBe(false); // "*" container
    expect(registry.accepts("ScriptBlock", "SceneBlock")).toBe(true);
    expect(registry.accepts(null, "TabItemBlock")).toBe(false);
  });
  it("caps section nesting at five levels (h2–h6)", () => {
    expect(registry.get("SectionBlock")?.maxNesting).toBe(5);
  });
});

describe("rich text", () => {
  const nodes = [{ type: "text" as const, text: "Hi " }, { type: "mention" as const, entryId: "1", collection: "weapon", slug: "sword", title: "Sword" }];
  it("reads and writes localized values without losing other locales", () => {
    const value = { en: nodes, pt: [{ type: "text" as const, text: "Olá" }] };
    expect(richTextToPlain(value, "en")).toBe("Hi Sword");
    expect(richTextToPlain(value, "pt")).toBe("Olá");
    expect(richTextToPlain(value, "es")).toBe("Hi Sword"); // falls back to en
    const next = updateRichText(value, "pt", [{ type: "text", text: "Oi" }]) as any;
    expect(next.en).toBe(nodes);
    expect(next.pt[0].text).toBe("Oi");
    expect(updateRichText(nodes, "en", [])).toEqual([]);
    expect(resolveRichText("plain")).toEqual([{ type: "text", text: "plain" }]);
    expect(isRichTextEmpty([])).toBe(true);
  });
  it("gives every collection a stable colour, overridable", () => {
    expect(collectionColor("weapon")).toBe(collectionColor("weapon"));
    expect(collectionColor("weapon", "#123456")).toBe("#123456");
  });
});

describe("0007 rich text migration", () => {
  it("upgrades page mentions with their collection and makes section titles rich", () => {
    const lookup = new Map([["e1", { collection: "weapon", slug: "excalibur" }]]);
    const out = upgradeRichTextContent(
      {
        blocks: [
          {
            id: "s",
            type: "SectionBlock",
            props: { title: { en: "Lore", pt: "História" }, level: 3 },
            children: [
              {
                id: "p",
                type: "ParagraphBlock",
                props: { text: [{ type: "page_mention", pageId: "e1", pageSlug: "old", displayTitle: "Excalibur" }] },
              },
            ],
          },
        ],
        properties: {},
      },
      lookup,
    );
    const section = out.blocks[0]!;
    expect(section.props["level"]).toBeUndefined();
    expect(section.props["title"]).toEqual({
      en: [{ type: "text", text: "Lore" }],
      pt: [{ type: "text", text: "História" }],
    });
    expect(section.children![0]!.props["text"]).toEqual([
      { type: "mention", entryId: "e1", collection: "weapon", slug: "excalibur", title: "Excalibur" },
    ]);
  });
});
