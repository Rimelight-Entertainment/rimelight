import { describe, expect, it } from "vite-plus/test";
import { BlockRegistry } from "../src/core/blocks/registry";
import { builtinBlocks } from "../src/core/blocks/builtins";
import { isSafeHttpUrl, toEmbedUrl } from "../src/core/blocks/embed";

const registry = new BlockRegistry().register(...builtinBlocks);

describe("built-in block definitions", () => {
  it("only references block types that exist", () => {
    const known = new Set(builtinBlocks.map((d) => d.type));
    for (const def of builtinBlocks) {
      for (const child of Array.isArray(def.children) ? def.children : []) {
        expect(known.has(child), `${def.type} lists unknown child ${child}`).toBe(true);
      }
      for (const parent of def.parents ?? []) {
        expect(known.has(parent), `${def.type} lists unknown parent ${parent}`).toBe(true);
      }
    }
  });

  it("agrees both ways: a parent that lists a child is accepted by that child", () => {
    for (const def of builtinBlocks) {
      if (!Array.isArray(def.children)) continue;
      for (const child of def.children) {
        const childDef = registry.get(child)!;
        expect(
          !childDef.parents || childDef.parents.includes(def.type),
          `${child} is listed under ${def.type} but its parents exclude it`,
        ).toBe(true);
      }
    }
  });

  it("keeps inline text props in their defaults, and marks rich text correctly", () => {
    for (const def of builtinBlocks) {
      if (!def.inlineText) continue;
      expect(def.defaultProps, `${def.type}.defaultProps`).toHaveProperty(def.inlineText);
      const value = def.defaultProps[def.inlineText];
      if (def.richText) expect(Array.isArray(value), `${def.type} stores rich text`).toBe(true);
    }
  });

  it("gives every block a label and a category", () => {
    for (const def of builtinBlocks) {
      expect(def.label, def.type).toBeTruthy();
      expect(def.category, def.type).toBeTruthy();
    }
  });
});

describe("new base blocks", () => {
  it("divider is a leaf that can sit at the root and in sections", () => {
    expect(registry.accepts(null, "DividerBlock")).toBe(true);
    expect(registry.accepts("SectionBlock", "DividerBlock")).toBe(true);
    expect(registry.create("DividerBlock").children).toBeUndefined();
  });

  it("quote is rich text with an attribution prop", () => {
    expect(registry.create("QuoteBlock").props).toEqual({ text: [], attribution: "" });
    expect(registry.get("QuoteBlock")?.richText).toBe(true);
    expect(registry.accepts("SectionBlock", "QuoteBlock")).toBe(true);
  });

  it("video is a leaf with a url and caption", () => {
    expect(registry.create("EmbedBlock").props).toEqual({ url: "", caption: "" });
    expect(registry.get("EmbedBlock")?.fields?.["url"]?.type).toBe("url");
  });
});

describe("embed urls", () => {
  it("turns YouTube and Vimeo page links into embeddable iframes", () => {
    expect(toEmbedUrl("https://www.youtube.com/watch?v=abc_DEF-123")).toBe(
      "https://www.youtube-nocookie.com/embed/abc_DEF-123",
    );
    expect(toEmbedUrl("https://youtu.be/abc123")).toBe(
      "https://www.youtube-nocookie.com/embed/abc123",
    );
    expect(toEmbedUrl("https://m.youtube.com/embed/abc123")).toBe(
      "https://www.youtube-nocookie.com/embed/abc123",
    );
    expect(toEmbedUrl("https://vimeo.com/76979871")).toBe(
      "https://player.vimeo.com/video/76979871",
    );
  });

  it("refuses anything it cannot vouch for", () => {
    expect(toEmbedUrl("https://www.youtube.com/watch")).toBeNull();
    expect(toEmbedUrl("https://www.youtube.com/watch?v=a%22onload")).toBeNull();
    expect(toEmbedUrl("https://vimeo.com/channels/staffpicks")).toBeNull();
    expect(toEmbedUrl("http://youtu.be/abc123")).toBeNull();
    expect(toEmbedUrl("https://example.com/video")).toBeNull();
    expect(toEmbedUrl("not a url")).toBeNull();
  });

  it("only links https urls, never javascript: or data:", () => {
    expect(isSafeHttpUrl("https://example.com")).toBe(true);
    expect(isSafeHttpUrl("http://example.com")).toBe(false);
    expect(isSafeHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeHttpUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isSafeHttpUrl("")).toBe(false);
  });
});
