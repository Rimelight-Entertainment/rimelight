import { describe, it, expect } from "vite-plus/test";

import { RLQuote } from "../src/components/quote/RLQuote";
import { renderSolid } from "./utils/normalize";

describe("RLQuote", () => {
  it("renders children inside the blockquote by default", () => {
    const html = renderSolid(RLQuote, {}, "Quoted text");
    expect(html).toContain("<blockquote");
    expect(html).toMatch(/<blockquote[^>]*data-slot="quote"[^>]*>Quoted text<\/blockquote>/);
  });

  it("renders as a figure by default", () => {
    const html = renderSolid(RLQuote, {}, "Quoted text");
    expect(html.startsWith("<figure")).toBe(true);
  });

  it("honors the as prop", () => {
    const html = renderSolid(RLQuote, { as: "section" }, "Quoted text");
    expect(html.startsWith("<section")).toBe(true);
  });

  it("replaces children with quoteSlot", () => {
    const html = renderSolid(RLQuote, { quoteSlot: "Slot text" }, "Child text");
    expect(html).toContain("Slot text");
    expect(html).not.toContain("Child text");
  });

  it("renders captionSlot in a figcaption", () => {
    const html = renderSolid(RLQuote, { captionSlot: "Attribution" }, "Quoted text");
    expect(html).toMatch(/<figcaption[^>]*data-slot="caption"[^>]*>Attribution<\/figcaption>/);
  });

  it("omits the figcaption when captionSlot is not provided", () => {
    const html = renderSolid(RLQuote, {}, "Quoted text");
    expect(html).not.toContain("figcaption");
  });

  it("forwards extra attributes to the root element", () => {
    const html = renderSolid(RLQuote, { id: "quote-1" }, "Quoted text");
    expect(html).toMatch(/<figure[^>]*id="quote-1"/);
  });
});
