import { describe, it, expect } from "vite-plus/test";
import { defaultOgLayout, handleOgRequest } from "../src/og/index";

describe("@rimelight/seo defaultOgLayout", () => {
  it("should render clean vector SVG with title and brand", () => {
    const svg = defaultOgLayout({
      title: "My Amazing Blog Post",
      brand: "Rimelight",
      badge: "Blog",
      description: "A deep dive into testing and safety.",
    });

    expect(typeof svg).toBe("string");
    expect(svg).toContain("<svg");
    expect(svg).toContain('viewBox="0 0 1200 630"');
    expect(svg).toContain("My Amazing Blog Post");
    expect(svg).toContain("Rimelight");
    expect(svg).toContain("Blog");
    expect(svg).toContain("A deep dive into testing and safety.");
  });

  it("should truncate overly long titles and descriptions safely", () => {
    const longTitle = "A".repeat(200);
    const longDesc = "B".repeat(300);

    const svg = defaultOgLayout({
      title: longTitle,
      description: longDesc,
    });

    expect(svg).toContain("…");
  });

  it("should support gradient background and preview overlay", () => {
    const svg = defaultOgLayout({
      title: "Preview Post",
      background: "gradient",
      preview: true,
    });

    expect(svg).toContain("url(#bg-gradient)");
    expect(svg).toContain("PREVIEW");
  });

  it("handleOgRequest should return 200 with image/svg+xml", async () => {
    const req = new Request("https://example.com/open-graph/card.svg?title=Hello+World&type=Blog");
    const res = await handleOgRequest(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("image/svg+xml");
    const text = await res.text();
    expect(text).toContain("<svg");
    expect(text).toContain("Hello World");
    expect(text).toContain("Blog");
  });
});
