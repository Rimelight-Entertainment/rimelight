import { describe, expect, it } from "vite-plus/test";
import { buildLlmsTxt, buildLlmsFullTxt } from "../src/llms";

describe("seo-llms", () => {
  it("builds standard /llms.txt with sections and pages", () => {
    const output = buildLlmsTxt({
      site: "https://rimelight.com",
      title: "Rimelight Documentation",
      description: "Docs for developers and AI agents.",
      pages: [
        {
          title: "Introduction",
          url: "https://rimelight.com/en/docs/overview/introduction",
          markdownUrl: "https://rimelight.com/en/docs/overview/introduction.md",
          description: "Getting started guide",
          section: "Overview",
        },
        {
          title: "Architecture",
          url: "https://rimelight.com/en/docs/overview/architecture",
          markdownUrl: "https://rimelight.com/en/docs/overview/architecture.md",
          section: "Overview",
        },
      ],
    });

    expect(output).toContain("# Rimelight Documentation");
    expect(output).toContain(
      "Full corpus (all pages, one document): https://rimelight.com/llms-full.txt",
    );
    expect(output).toContain("### Overview");
    expect(output).toContain(
      "- [Introduction](https://rimelight.com/en/docs/overview/introduction.md) — Getting started guide",
    );
    expect(output).toContain(
      "- [Architecture](https://rimelight.com/en/docs/overview/architecture.md)",
    );
  });

  it("builds full corpus /llms-full.txt", () => {
    const output = buildLlmsFullTxt({
      site: "https://rimelight.com",
      title: "Rimelight Docs",
      pages: [
        {
          title: "Quickstart",
          url: "https://rimelight.com/en/docs/quickstart",
          description: "Step-by-step tutorial",
          version: "v1",
          markdown: "Run `vp dev` to start the development server.",
        },
      ],
    });

    expect(output).toContain("# Rimelight Docs — Full Documentation Corpus");
    expect(output).toContain("## Quickstart");
    expect(output).toContain("URL: https://rimelight.com/en/docs/quickstart");
    expect(output).toContain("Version: v1");
    expect(output).toContain("Run `vp dev` to start the development server.");
  });
});
