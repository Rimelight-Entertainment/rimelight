import { describe, expect, it } from "vite-plus/test";
import { getLocaleInfo } from "../src/index";

describe("getLocaleInfo", () => {
  it("derives tag, label and direction from the locale code", () => {
    expect(getLocaleInfo("pt")).toEqual({
      code: "pt",
      tag: "pt-BR",
      label: "Português",
      dir: "ltr",
    });
    expect(getLocaleInfo("en").tag).toBe("en-US");
    expect(getLocaleInfo("ar").dir).toBe("rtl");
  });

  it("keeps an explicit region", () => {
    expect(getLocaleInfo("pt-PT").tag).toBe("pt-PT");
  });

  it("falls back to the code for unknown values", () => {
    expect(getLocaleInfo("not a locale").tag).toBe("not a locale");
  });
});
