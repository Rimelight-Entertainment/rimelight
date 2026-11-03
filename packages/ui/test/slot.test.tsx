import { describe, it, expect } from "vite-plus/test";
import { createRoot } from "solid-js";
import { renderToString } from "@solidjs/web";

import { slot } from "../src/slot";
import { RLCardTheme } from "../src/components/card/card.theme";

describe("slot", () => {
  it("evaluates the getter once no matter how many times the accessor is read", () => {
    let evaluations = 0;
    createRoot((dispose) => {
      const read = slot(() => {
        evaluations++;
        return "value";
      });
      expect(read()).toBe("value");
      expect(read()).toBe("value");
      expect(read()).toBe("value");
      dispose();
    });
    expect(evaluations).toBe(1);
  });

  it("returns function-typed slots without calling them", () => {
    let calls = 0;
    const renderer = (arg: string) => {
      calls++;
      return arg;
    };
    createRoot((dispose) => {
      const read = slot(() => renderer);
      expect(read()).toBe(renderer);
      expect(calls).toBe(0);
      dispose();
    });
  });
});

// `setup()` calls createUniqueId, which needs a component owner, so these run inside a render.
describe("resolver setup with slots", () => {
  it("returns memoized accessors for declared slot keys", () => {
    const headerValue = { label: "header" };
    let captured: any;
    renderToString(() => {
      captured = RLCardTheme.setup({ headerSlot: headerValue, id: "card-1" } as any, {
        slots: ["headerSlot"] as const,
      });
      return null;
    });
    expect(captured.slots.headerSlot()).toBe(headerValue);
  });

  it("strips slot keys from rest", () => {
    let rest: Record<string, unknown> = {};
    renderToString(() => {
      const props = { headerSlot: "h", bodySlot: "b", "data-test": "keep" } as any;
      rest = RLCardTheme.setup(props, { slots: ["headerSlot", "bodySlot"] as const })
        .rest as Record<string, unknown>;
      return null;
    });
    expect(rest).not.toHaveProperty("headerSlot");
    expect(rest).not.toHaveProperty("bodySlot");
    expect(rest["data-test"]).toBe("keep");
  });

  it("merges slot keys with explicit omit keys", () => {
    let rest: Record<string, unknown> = {};
    renderToString(() => {
      const props = { headerSlot: "h", title: "t", extra: 1 } as any;
      rest = RLCardTheme.setup(props, {
        omit: ["title"] as const,
        slots: ["headerSlot"] as const,
      }).rest as Record<string, unknown>;
      return null;
    });
    expect(rest).not.toHaveProperty("headerSlot");
    expect(rest).not.toHaveProperty("title");
    expect(rest["extra"]).toBe(1);
  });
});
