import { describe, it, expect } from "vite-plus/test";
import { createUiHead } from "../src/head";

describe("createUiHead", () => {
  it("generates the theme flash script tag", () => {
    const tags = createUiHead();
    expect(tags.length).toBe(1);
    expect(tags[0]?.tag).toBe("script");
    expect(String(tags[0]?.props?.["children"])).toContain("applyTheme");
  });
});
