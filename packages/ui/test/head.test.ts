import { describe, it, expect } from "vite-plus/test";
import { createUiHead } from "../src/head";
import type { HeadTag } from "../src/head";

describe("createUiHead", () => {
  it("generates the theme flash script by default", () => {
    const result = createUiHead();
    expect(result.html).toContain("applyTheme");
    expect(result.tags.length).toBe(1);
    expect(result.tags[0]?.tag).toBe("script");
  });

  it("attaches nonce when provided", () => {
    const result = createUiHead({ nonce: "test-nonce" });
    expect(result.html).toContain('nonce="test-nonce"');
    const scripts = result.tags.filter(
      (t): t is Extract<HeadTag, { tag: "script" }> => t.tag === "script",
    );
    expect(scripts[0]?.props?.nonce).toBe("test-nonce");
  });

  it("honors themeSync: false to skip the theme flash script", () => {
    const noTheme = createUiHead({ themeSync: false });
    expect(noTheme.html).not.toContain("applyTheme");
    expect(noTheme.tags.length).toBe(0);
  });
});
