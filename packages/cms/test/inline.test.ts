import { describe, expect, it } from "vite-plus/test";
import {
  collectMentionIds,
  collectMentions,
  inlineToPlainText,
  resolveRichText,
  stripResolvedMentions,
  updateRichText,
} from "../src/core/richtext";
import type { InlineNode } from "../src/core/types/inline";

describe("mentions", () => {
  const mention: InlineNode = {
    type: "mention",
    entryId: "e-1",
    collection: "character",
    slug: "aleph",
    title: "Aleph Lightbringer",
  };

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

  it("counts as text in plain-text output (title)", () => {
    expect(inlineToPlainText([{ type: "text", text: "Hi " }, mention])).toBe(
      "Hi Aleph Lightbringer",
    );
  });
});

describe("plain and rich values", () => {
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
