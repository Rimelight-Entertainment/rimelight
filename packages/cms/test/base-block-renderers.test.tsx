import { afterEach, describe, expect, it } from "vite-plus/test";
import { render } from "@solidjs/web";
import { BlockRenderer } from "../src/solid/BlockRenderer";
import { DividerBlock, EmbedBlock, QuoteBlock } from "../src/solid/blocks";
import type { BaseBlock } from "../src/core/types/blocks";

let dispose: (() => void) | undefined;
let host: HTMLElement | undefined;

function mount(view: () => any): HTMLElement {
  host = document.createElement("div");
  document.body.appendChild(host);
  dispose = render(view, host);
  return host;
}

afterEach(() => {
  dispose?.();
  host?.remove();
});

const block = (type: string, props: Record<string, any>): BaseBlock => ({
  id: `${type}-1`,
  type,
  props,
});

describe("DividerBlock", () => {
  it("renders a horizontal rule and nothing else", () => {
    const el = mount(() => <DividerBlock block={block("DividerBlock", {})} />);
    expect(el.querySelector("hr")).not.toBeNull();
    expect(el.textContent).toBe("");
  });
});

describe("QuoteBlock", () => {
  it("renders the quote text inside a blockquote, with its attribution", () => {
    const el = mount(() => (
      <QuoteBlock
        block={block("QuoteBlock", {
          text: [{ type: "text", text: "Ships are just boxes." }],
          attribution: "Ada",
        })}
      />
    ));
    const quote = el.querySelector("blockquote");
    expect(quote?.textContent).toContain("Ships are just boxes.");
    expect(el.querySelector("cite")?.textContent).toContain("Ada");
  });

  it("omits the citation when there is no attribution", () => {
    const el = mount(() => (
      <QuoteBlock block={block("QuoteBlock", { text: [{ type: "text", text: "Anon." }] })} />
    ));
    expect(el.querySelector("blockquote")?.textContent).toContain("Anon.");
    expect(el.querySelector("cite")).toBeNull();
  });
});

describe("EmbedBlock", () => {
  it("embeds a YouTube video in a privacy-enhanced iframe with its caption", () => {
    const el = mount(() => (
      <EmbedBlock
        block={block("EmbedBlock", {
          url: "https://www.youtube.com/watch?v=abc123",
          caption: "Trailer",
        })}
      />
    ));
    const frame = el.querySelector("iframe");
    expect(frame?.getAttribute("src")).toBe("https://www.youtube-nocookie.com/embed/abc123");
    expect(frame?.getAttribute("title")).toBe("Trailer");
    expect(el.querySelector("a")).toBeNull();
    expect(el.querySelector("figcaption")?.textContent).toBe("Trailer");
  });

  it("falls back to a plain, safely-attributed link for other https pages", () => {
    const el = mount(() => (
      <EmbedBlock block={block("EmbedBlock", { url: "https://example.com/clip" })} />
    ));
    expect(el.querySelector("iframe")).toBeNull();
    const link = el.querySelector("a");
    expect(link?.getAttribute("href")).toBe("https://example.com/clip");
    expect(link?.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("renders nothing clickable for javascript: urls", () => {
    const el = mount(() => (
      <EmbedBlock block={block("EmbedBlock", { url: "javascript:alert(1)" })} />
    ));
    expect(el.querySelector("iframe")).toBeNull();
    expect(el.querySelector("a")).toBeNull();
  });
});

describe("BlockRenderer with the built-in registry", () => {
  it("renders the new blocks by type", () => {
    const el = mount(() => <BlockRenderer block={block("DividerBlock", {})} locale="en" />);
    expect(el.querySelector("hr")).not.toBeNull();
  });
});
