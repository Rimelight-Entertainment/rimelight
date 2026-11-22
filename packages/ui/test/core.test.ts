import { describe, it, expect } from "vite-plus/test";

import { defineTheme } from "../src/resolver";
import { setUIConfig } from "../src/runtime";
import { resolveIcon } from "../src/icons";

describe("@rimelight/ui core resolver", () => {
  it("should merge slots and variants correctly", () => {
    const baseTheme = {
      slots: ["root", "label", "icon"],
      base: {
        root: "flex items-center",
        label: "text-sm",
        icon: "size-4",
      },
      variants: {
        variant: {
          solid: { root: "bg-blue-500 text-white" },
          outline: { root: "border border-blue-500" },
        },
        size: {
          sm: { root: "p-2", label: "text-xs" },
          md: { root: "p-4", label: "text-base" },
        },
      },
      defaultVariants: {
        variant: "solid",
        size: "md",
      },
    };

    const themeFn = defineTheme("testComponent", baseTheme);
    const slots = themeFn({ size: "sm", class: "custom-root", ui: { label: "font-bold" } });

    expect(slots["root"]).toContain("flex items-center");
    expect(slots["root"]).toContain("bg-blue-500");
    expect(slots["root"]).toContain("p-2");
    expect(slots["root"]).toContain("custom-root");
    expect(slots["label"]).toContain("text-xs");
    expect(slots["label"]).toContain("font-bold");
    expect(slots["icon"]).toBe("size-4");
  });

  it("should deep merge custom overrides without losing base slots", () => {
    setUIConfig({
      components: {
        themes: {
          testOverride: {
            base: { label: "overridden-label" },
            variants: {
              size: { sm: { root: "override-sm" } },
            },
          },
        },
      },
    });

    const baseTheme = {
      slots: ["root", "label", "icon"],
      base: {
        root: "flex items-center",
        label: "text-sm",
        icon: "size-4",
      },
      variants: {
        size: {
          sm: { root: "p-2", label: "text-xs" },
          md: { root: "p-4", label: "text-base" },
        },
      },
    };

    const themeFn = defineTheme("testOverride", baseTheme);
    const slots = themeFn({ size: "sm" });

    // slot 'icon' should not be lost even though testOverride only defined 'label'
    expect(slots["icon"]).toBe("size-4");
    // base.root should still be present
    expect(slots["root"]).toContain("flex items-center");
    // overridden variant and base slot should apply
    expect(slots["root"]).toContain("override-sm");
    expect(slots["label"]).toContain("overridden-label");

    setUIConfig(null);
  });
});

describe("@rimelight/ui core icon resolution", () => {
  it("should resolve class-based icons", () => {
    const icon = resolveIcon("i-lucide-check");
    expect(icon).toBe("i-lucide-check");
  });

  it("should resolve built-in names through the lucide default map", () => {
    const icon = resolveIcon("check");
    expect(icon).toBe("i-lucide-check");
  });

  it("should return an empty icon for raw SVG strings", () => {
    const rawSvg = '<svg><path d="M0 0"/></svg>';
    const icon = resolveIcon("customSvg", rawSvg);
    expect(icon).toBe("");
  });

  it("should resolve custom icon configured in uiConfig", () => {
    setUIConfig({
      icons: {
        customIcon: "i-custom-icon",
      },
    });

    const icon = resolveIcon("customIcon");
    expect(icon).toBe("i-custom-icon");

    setUIConfig(null);
  });

  it("should return empty icon for empty name and custom", () => {
    const icon = resolveIcon("");
    expect(icon).toBe("");
  });

  it("should match compound variants when color is auto", () => {
    const baseTheme = {
      slots: ["root"],
      base: { root: "btn" },
      variants: {
        color: "auto",
        variant: {
          solid: { root: "btn-solid" },
        },
      },
      compoundVariants: [
        {
          color: "neutral",
          variant: "solid",
          class: { root: "btn-neutral-solid" },
        },
      ],
      defaultVariants: {
        color: "primary",
        variant: "solid",
      },
    };

    const themeFn = defineTheme("testAutoColor", baseTheme);
    const primarySlots = themeFn({ color: "primary" });
    expect(primarySlots["root"]).toContain("rl-color-primary");
    expect(primarySlots["root"]).toContain("btn-solid");
    expect(primarySlots["root"]).not.toContain("btn-neutral-solid");

    const neutralSlots = themeFn({ color: "neutral" });
    expect(neutralSlots["root"]).toContain("rl-color-neutral");
    expect(neutralSlots["root"]).toContain("btn-neutral-solid");
  });
});

describe("@rimelight/ui preset intent shortcuts", () => {
  it("should expand intent shortcuts properly via UnoCSS", async () => {
    const { createGenerator } = await import("unocss");
    const { rimelightUiPreset } = await import("../src/preset");
    const uno = await createGenerator({
      presets: [rimelightUiPreset()],
    });

    const { css } = await uno.generate(
      "text-muted bg-elevated border-accented ring-dimmed bg-inverted text-muted/50",
    );
    // text-muted and bg-elevated are role-backed (ST3.2): same colour as the role variable.
    expect(css).toContain("var(--rl-color-text-muted)");
    expect(css).toContain("var(--rl-color-surface-raised)");
    expect(css).toContain("var(--rl-color-border-strong)");
    expect(css).toContain("var(--rl-color-border-strong)");
    expect(css).toContain("var(--rl-neutral-950)");
    expect(css).toContain("var(--rl-neutral-50)");
    expect(css).not.toContain("--colors-");
    expect(css).toContain(".text-muted\\/50");
  }, 15000);
});

describe("@rimelight/ui shortcuts formatting", () => {
  it("should format shortcut keys correctly", async () => {
    const { formatShortcutKeys } = await import("../src/shortcuts");
    expect(formatShortcutKeys("meta_k")).toEqual([expect.any(String), "K"]);
    expect(formatShortcutKeys("ctrl_alt_delete")).toEqual(["Ctrl", "Alt", "⌦"]);
    expect(formatShortcutKeys("g-d")).toEqual(["G", "D"]);
  });
});

describe("@rimelight/ui inlined cx", () => {
  it("should compose class names with cx", async () => {
    const { cx } = await import("../src/resolver");
    const isFalse = false;
    expect(cx("a", isFalse && "b", null, undefined, ["c", ["d"]], { e: true, f: false })).toBe(
      "a c d e",
    );
  });
});

describe("@rimelight/ui unstyled mode", () => {
  it("should preserve props.class and props.ui overrides when unstyled", async () => {
    (await import("virtual:rimelight-ui")).config.unstyled = true;
    const { defineTheme } = await import("../src/resolver");

    const themeFn = defineTheme("testUnstyled", {
      slots: ["root", "label"],
      base: { root: "base-root", label: "base-label" },
    });

    const slots = themeFn({ class: "custom-class", ui: { label: "custom-ui-label" } });
    expect(slots["root"]).toBe("custom-class");
    expect(slots["root"]).not.toContain("base-root");
    expect(slots["label"]).toBe("custom-ui-label");
    expect(slots["label"]).not.toContain("base-label");
  });
});

describe("@rimelight/ui logo & image themes", () => {
  it("should export and resolve RLImageTheme properly", async () => {
    (await import("virtual:rimelight-ui")).config.unstyled = false;
    const { RLImageTheme } = await import("../src/components/image/image.theme");
    const slots = RLImageTheme({ class: "custom-image", fit: "contain" });
    expect(slots["root"]).toContain("relative inline-block");
    expect(slots["root"]).toContain("custom-image");
    expect(slots["trigger"]).toContain("cursor-pointer");
    expect(slots["triggerImage"]).toContain("max-w-full");
    expect(slots["triggerImage"]).toContain("h-auto");
    expect(slots["triggerImage"]).toContain("object-contain");
    expect(slots["figure"]).toContain("inline-flex");
    expect(slots["caption"]).toContain("text-muted");
  });
});
