import { describe, expect, it } from "vite-plus/test";
import { resolveButtonVariant } from "../src/components/button/button.helpers";

describe("Button legacy variant aliases (ST3.3)", () => {
  it("passes catalogue variants through unchanged", () => {
    expect(resolveButtonVariant("outline", "neutral")).toEqual({
      variant: "outline",
      color: "neutral",
    });
    expect(resolveButtonVariant(undefined, undefined)).toEqual({
      variant: undefined,
      color: undefined,
    });
  });

  it("maps primary, secondary and danger onto solid/outline with a colour", () => {
    expect(resolveButtonVariant("primary", undefined)).toEqual({
      variant: "solid",
      color: "primary",
    });
    expect(resolveButtonVariant("secondary", undefined)).toEqual({
      variant: "outline",
      color: "neutral",
    });
    expect(resolveButtonVariant("danger", undefined)).toEqual({ variant: "solid", color: "error" });
  });

  it("keeps an explicit colour over the alias colour", () => {
    expect(resolveButtonVariant("primary", "success")).toEqual({
      variant: "solid",
      color: "success",
    });
  });
});
