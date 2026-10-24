import { describe, expect, it } from "vite-plus/test";
import { extractHeadingsFromBlocks, slugifyHeading } from "../src/docs/toc";

describe("cms-docs-toc", () => {
  it("slugifies titles into valid URL anchor slugs", () => {
    expect(slugifyHeading("Getting Started with Rimelight!")).toBe(
      "getting-started-with-rimelight",
    );
    expect(slugifyHeading("Section 1.2: Advanced Features")).toBe("section-12-advanced-features");
  });

  it("derives heading depth from nesting (rich titles, no stored level)", () => {
    const t = (text: string) => [{ type: "text", text }];
    const blocks: any[] = [
      {
        id: "1",
        type: "SectionBlock",
        props: { title: t("Introduction") },
        children: [
          { id: "2", type: "SectionBlock", props: { title: t("Core Concepts") }, children: [] },
          {
            id: "3",
            type: "CalloutBlock",
            props: {},
            children: [{ id: "4", type: "SectionBlock", props: { title: t("Inside a callout") } }],
          },
        ],
      },
      { id: "5", type: "SectionBlock", props: { title: { en: t("Configuration") } } },
    ];

    expect(extractHeadingsFromBlocks(blocks)).toEqual([
      { depth: 2, slug: "introduction", text: "Introduction" },
      { depth: 3, slug: "core-concepts", text: "Core Concepts" },
      { depth: 3, slug: "inside-a-callout", text: "Inside a callout" },
      { depth: 2, slug: "configuration", text: "Configuration" },
    ]);
  });
});
