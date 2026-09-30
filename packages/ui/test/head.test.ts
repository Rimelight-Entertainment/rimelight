import { describe, it, expect } from "vite-plus/test";
import { createUiHead } from "../src/head.js";
import type { HeadTag } from "../src/head.js";

describe("createUiHead", () => {
  it("generates theme flash script and header stack script by default", () => {
    const result = createUiHead();
    expect(result.html).toContain("applyTheme");
    expect(result.html).toContain("RLHeaderStack");
    expect(result.tags.length).toBe(2);
    expect(result.tags[0]?.tag).toBe("script");
    expect(result.tags[1]?.tag).toBe("script");
  });

  it("attaches nonce when provided", () => {
    const result = createUiHead({ nonce: "test-nonce" });
    expect(result.html).toContain('nonce="test-nonce"');
    const scripts = result.tags.filter(
      (t): t is Extract<HeadTag, { tag: "script" }> => t.tag === "script",
    );
    expect(scripts[0]?.props?.nonce).toBe("test-nonce");
    expect(scripts[1]?.props?.nonce).toBe("test-nonce");
  });

  it("honors boolean flags to disable specific scripts", () => {
    const noTheme = createUiHead({ themeSync: false });
    expect(noTheme.html).not.toContain("applyTheme");
    expect(noTheme.html).toContain("RLHeaderStack");
    expect(noTheme.tags.length).toBe(1);

    const noStack = createUiHead({ headerStack: false });
    expect(noStack.html).toContain("applyTheme");
    expect(noStack.html).not.toContain("RLHeaderStack");
    expect(noStack.tags.length).toBe(1);
  });
});
