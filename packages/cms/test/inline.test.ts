import { describe, expect, it } from "vite-plus/test";
import {
  htmlToInline,
  inlineToHtml,
  mentionHtml,
  toInlineNodes,
  toPlainText,
} from "../src/editor/inline";
import {
  collectMentionIds,
  collectMentions,
  compactRichText,
  resolveRichText,
  stripResolvedMentions,
  updateRichText,
} from "../src/core/richtext";
import type { InlineNode } from "../src/core/types/inline";

/** Render → DOM → parse: what the user sees and types, read back into the stored AST. */
function roundTrip(nodes: InlineNode[]): InlineNode[] {
  const host = document.createElement("div");
  host.innerHTML = inlineToHtml(nodes);
  return htmlToInline(host);
}

describe("inline marks", () => {
  it("round-trips every mark, including stacked marks", () => {
    const nodes: InlineNode[] = [
      { type: "text", text: "b", marks: ["bold"] },
      { type: "text", text: "i", marks: ["italic"] },
      { type: "text", text: "u", marks: ["underline"] },
      { type: "text", text: "s", marks: ["strikethrough"] },
      { type: "text", text: "c", marks: ["code"] },
      { type: "text", text: "bi", marks: ["bold", "italic"] },
    ];
    expect(roundTrip(nodes)).toEqual(compactRichText(nodes));
  });

  it("keeps plain text that looks like markup as text", () => {
    const nodes: InlineNode[] = [{ type: "text", text: '<b>not bold</b> & "quotes"' }];
    expect(roundTrip(nodes)).toEqual(nodes);
  });

  it("reads a pasted <strong> and <em> as marks", () => {
    const host = document.createElement("div");
    host.innerHTML = "<strong>a</strong><em>b</em>";
    expect(htmlToInline(host)).toEqual([
      { type: "text", text: "a", marks: ["bold"] },
      { type: "text", text: "b", marks: ["italic"] },
    ]);
  });

  it("turns a trailing <br> into no newline, but keeps inner line breaks", () => {
    const host = document.createElement("div");
    host.innerHTML = "one<br>two<br>";
    expect(htmlToInline(host)).toEqual([{ type: "text", text: "one\ntwo" }]);
  });
});

describe("links", () => {
  it("round-trips a link with marked children and its new-tab flag", () => {
    const nodes: InlineNode[] = [
      {
        type: "link",
        url: "https://rimelight.com",
        openInNewTab: true,
        children: [
          { type: "text", text: "go", marks: ["bold"] },
          { type: "text", text: " now" },
        ],
      },
    ];
    expect(roundTrip(nodes)).toEqual(nodes);
  });

  it("unwraps a link without a URL into plain text", () => {
    const host = document.createElement("div");
    host.innerHTML = "<a>just text</a>";
    expect(htmlToInline(host)).toEqual([{ type: "text", text: "just text" }]);
  });
});

describe("mentions", () => {
  const mention: InlineNode = {
    type: "mention",
    entryId: "e-1",
    collection: "character",
    slug: "aleph",
    title: "Aleph Lightbringer",
  };

  it("round-trips the stored fields", () => {
    expect(roundTrip([mention])).toEqual([mention]);
  });

  it("derives the colour from the collection at render time, never stores it", () => {
    const html = mentionHtml(mention, {
      mentionColor: (c) => (c === "character" ? "#f00" : "#000"),
    });
    expect(html).toContain("color:#f00");
    // Parsing the rendered span drops the colour: it is not part of the stored node.
    const host = document.createElement("div");
    host.innerHTML = html;
    expect(htmlToInline(host)).toEqual([mention]);
  });

  it("is not editable and shows the title, falling back to the slug", () => {
    expect(mentionHtml(mention)).toContain('contenteditable="false"');
    expect(mentionHtml({ ...mention, title: undefined })).toContain(">aleph<");
  });

  it("strips delivery-only colour and href before saving", () => {
    const delivered = { ...mention, color: "#f00", href: "/characters/aleph" };
    expect(stripResolvedMentions([delivered])).toEqual([mention]);
  });

  it("collects mentions from flat and localized values", () => {
    const flat = [{ type: "text", text: "x" }, mention];
    expect(collectMentions(flat)).toEqual([{ entryId: "e-1", collection: "character" }]);
    expect(collectMentions({ en: flat, pt: [] })).toEqual([
      { entryId: "e-1", collection: "character" },
    ]);
  });

  it("counts as text in plain-text output (title, then slug)", () => {
    expect(toPlainText([{ type: "text", text: "Hi " }, mention])).toBe("Hi Aleph Lightbringer");
  });
});

describe("emoji and icons", () => {
  it("round-trip as atomic nodes", () => {
    const nodes: InlineNode[] = [
      { type: "emoji", emoji: "🔥", shortcode: "fire" },
      { type: "text", text: " " },
      { type: "icon", name: "i-lucide-star", label: "Star" },
    ];
    expect(roundTrip(nodes)).toEqual(nodes);
  });
});

describe("plain and rich values", () => {
  it("turns a plain string into one text node and back", () => {
    expect(toInlineNodes("hello")).toEqual([{ type: "text", text: "hello" }]);
    expect(toPlainText("hello")).toBe("hello");
  });

  it("resolves a localized value with fallback, then the first locale present", () => {
    const value = { pt: [{ type: "text", text: "olá" }], en: [{ type: "text", text: "hi" }] };
    expect(resolveRichText(value, "pt")).toEqual([{ type: "text", text: "olá" }]);
    expect(resolveRichText(value, "es")).toEqual([{ type: "text", text: "hi" }]);
    expect(resolveRichText({ pt: [{ type: "text", text: "só" }] }, "es")).toEqual([
      { type: "text", text: "só" },
    ]);
  });

  it("writes one locale into a localized map without touching the others", () => {
    const before = { en: [{ type: "text", text: "hi" }] } as const;
    const after = updateRichText(before, "pt", [{ type: "text", text: "oi" }]);
    expect(after).toEqual({
      en: [{ type: "text", text: "hi" }],
      pt: [{ type: "text", text: "oi" }],
    });
  });

  it("translating plain text keeps the default-locale text intact", () => {
    const english = [{ type: "text", text: "hi" }] as const;
    const pt = updateRichText([...english], "pt", [{ type: "text", text: "oi" }], {
      defaultLocale: "en",
    });
    expect(pt).toEqual({
      en: [{ type: "text", text: "hi" }],
      pt: [{ type: "text", text: "oi" }],
    });
    // Editing the default locale of plain text stays plain.
    expect(
      updateRichText([...english], "en", [{ type: "text", text: "hey" }], { defaultLocale: "en" }),
    ).toEqual([{ type: "text", text: "hey" }]);
  });

  it("keeps a plain value plain unless it is marked translatable", () => {
    const nodes = [{ type: "text", text: "x" }] as const;
    expect(updateRichText([], "en", [...nodes])).toEqual([{ type: "text", text: "x" }]);
    expect(updateRichText([], "en", [...nodes], { translatable: true })).toEqual({
      en: [{ type: "text", text: "x" }],
    });
  });
});

describe("mention ids", () => {
  const mention = {
    type: "mention",
    entryId: "e-1",
    collection: "character",
    slug: "aleph",
    title: "Aleph",
  };
  it("collects each distinct mentioned entry id from nested blocks and localized values", () => {
    const value = {
      blocks: [
        { id: "b1", props: { text: [mention] } },
        { id: "b2", props: { line: { en: [mention, { ...mention, entryId: "e-2" }] } } },
      ],
    };
    expect(collectMentionIds(value).sort()).toEqual(["e-1", "e-2"]);
    expect(collectMentionIds([{ type: "text", text: "plain" }])).toEqual([]);
  });
});
