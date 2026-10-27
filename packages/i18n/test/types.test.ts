import { describe, expect, expectTypeOf, it } from "vite-plus/test";
import { t } from "../src/index";
import type { TFunction, TranslationArgs, TranslationKey } from "../src/types";

// Each `@ts-expect-error` fails `vp check` if the error stops happening, so these are compile-time tests.
type Registry = {
  "nav.home": never;
  "messages.welcome": { user: string | number };
  items: { count: number; name: string | number };
};
const typed = t as unknown as TFunction<Registry>;

describe("typed t() keys", () => {
  it("accepts only registry keys", () => {
    expectTypeOf<TranslationKey<Registry>>().toEqualTypeOf<
      "nav.home" | "messages.welcome" | "items"
    >();
    // @ts-expect-error unknown key
    typed("nope");
    // @ts-expect-error typo of a real key
    typed("nav.hme");
  });

  it("requires params exactly when the key has placeholders or plurals", () => {
    // @ts-expect-error missing placeholder param
    typed("messages.welcome");
    // @ts-expect-error empty params for a placeholder
    typed("messages.welcome", {});
    // @ts-expect-error params given to a key without placeholders
    typed("nav.home", { x: 1 });
    typed("messages.welcome", { user: "Ana" });
    typed("nav.home");
    typed("nav.home", undefined, "pt");
  });

  it("requires count for plural keys", () => {
    // @ts-expect-error count missing
    typed("items", { name: "x" });
    typed("items", { count: 2, name: "x" });
  });

  it("falls back to any string key before generation", () => {
    expectTypeOf<TranslationKey<{}>>().toEqualTypeOf<string>();
    expectTypeOf<TranslationArgs<string, {}>>().toEqualTypeOf<
      [params?: Record<string, unknown> | undefined, locale?: string | undefined]
    >();
    expect(t("anything.goes")).toBe("anything.goes");
  });
});
