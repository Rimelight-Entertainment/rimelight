import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";
import { createGenerator } from "unocss";
import designTokens from "@rimelight/design/tokens.json";
import { rimelightUiPreset } from "../src/preset";

const SHADES = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
const BUILT_IN = [
  "neutral",
  "primary",
  "secondary",
  "info",
  "success",
  "warning",
  "error",
  "commentary",
  "ideation",
  "source",
];

const lc = (s: string) => s.toLowerCase();
const DESIGN = designTokens as unknown as Record<string, { $type: string; $value: any }>;

async function preflight(colors?: Record<string, any>) {
  const uno = await createGenerator({ presets: [rimelightUiPreset(colors ? { colors } : {})] });
  const { css } = await uno.generate("text-highlighted", { preflights: true });
  return css;
}

describe("built-in palettes come from @rimelight/design", () => {
  it("primary-500 is the design value (light #0D7FFF)", async () => {
    const css = await preflight();
    const ramp = DESIGN["ramp.primary.500"]!.$value;
    expect(ramp.light).toBe("#0D7FFF");
    expect(css).toContain(`--rl-primary-500: light-dark(${lc(ramp.light)}, ${lc(ramp.dark)});`);
  });

  it("every built-in shade matches the design ramp exactly once", async () => {
    const css = await preflight();
    for (const name of BUILT_IN) {
      for (const s of SHADES) {
        const { light, dark } = DESIGN[`ramp.${name}.${s}`]!.$value;
        const decl = `--rl-${name}-${s}: light-dark(${lc(light)}, ${lc(dark)});`;
        expect(css.split(decl).length - 1, decl).toBe(1);
      }
    }
  });

  it("a custom palette with a new name still goes through the OKLCH path", async () => {
    const css = await preflight({ brand: [0.2, 30] });
    expect(css).toMatch(/--rl-brand-500: light-dark\(oklch\(/);
    expect(css).toContain(`--rl-primary-500: light-dark(#0d7fff, #4da0ff);`);
  });

  it("a custom palette with a built-in name overrides the design value", async () => {
    const css = await preflight({ primary: [0.2, 30] });
    expect(css).toMatch(/--rl-primary-500: light-dark\(oklch\(/);
    expect(css).not.toContain("--rl-primary-500: light-dark(#0d7fff, #4da0ff);");
    // Other built-ins keep their design values.
    expect(css).toContain("--rl-neutral-50: light-dark(#f9fafb, #090a0b);");
  });
});

describe("role variables are emitted in the preflight", () => {
  it("emits colour, size, radius, motion, type, font and shadow roles", async () => {
    const css = await preflight();
    expect(css).toContain("--rl-color-accent-default: light-dark(#0d7fff, #4da0ff);");
    expect(css).toContain("--rl-radius-control: 6px;");
    expect(css).toContain("--rl-size-sidebar-width: 240px;");
    expect(css).toContain("--rl-motion-base: 200ms;");
    expect(css).toContain("--rl-motion-ease-standard: cubic-bezier(0.2, 0, 0, 1);");
    expect(css).toContain("--rl-type-body-font-size: 14px;");
    expect(css).toContain("--rl-type-body-font-weight: 400;");
    expect(css).toContain('--rl-font-sans: "Noto Sans", sans-serif;');
    expect(css).toContain("--rl-shadow-overlay-blur: 24px;");
    expect(css).toContain("--rl-focus-width: 2px;");
  });

  it("disables motion variables under reduced motion", async () => {
    const css = await preflight();
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\s*\{\s*:root\s*\{[^}]*--rl-motion-fast:\s*0ms/,
    );
  });

  it("every role declaration in generated/tokens.css is present", async () => {
    const css = await preflight();
    const tokensCss = readFileSync(
      new URL("../../design/generated/tokens.css", import.meta.url),
      "utf8",
    );
    const root = /:root \{([\s\S]*?)\n\}/.exec(tokensCss)![1]!;
    const decls = root
      .split("\n")
      .map((l) => /^\s*(--rl-[\w-]+): (.+);$/.exec(l))
      .filter((m): m is RegExpExecArray => m !== null)
      .filter((m) => !m[1]!.startsWith("--rl-ramp-") && !m[2]!.includes("var(--rl-ramp-"));
    expect(decls.length).toBeGreaterThan(200);
    for (const [, name, value] of decls) {
      expect(lc(css), name).toContain(lc(`${name}: ${value};`));
    }
  });
});

describe("role utilities (ST3.2)", () => {
  it("bg-elevated resolves to the surface-raised role variable", async () => {
    const uno = await createGenerator({ presets: [rimelightUiPreset()] });
    const { css } = await uno.generate("bg-elevated bg-surface-raised", { preflights: false });
    expect(css).toContain("var(--rl-color-surface-raised)");
    expect(css).not.toContain("--rl-neutral-200");
  });

  it("role colours are theme colours with their design key", async () => {
    const uno = await createGenerator({ presets: [rimelightUiPreset()] });
    const { css } = await uno.generate("ring-focus text-ink", { preflights: false });
    expect(css).toContain("var(--rl-color-focus-ring)");
    expect(css).toContain("var(--rl-color-text-primary)");
  });
});

describe("control heights come from the design sizes (ST3.4)", () => {
  it("Button and Input heights reference the control size tokens", async () => {
    const { readFileSync } = await import("node:fs");
    const button = readFileSync(
      new URL("../src/components/button/button.theme.ts", import.meta.url),
      "utf8",
    );
    const input = readFileSync(
      new URL("../src/components/input/input.theme.ts", import.meta.url),
      "utf8",
    );
    for (const z of ["xs", "sm", "md", "lg", "xl"]) {
      expect(button).toContain(`h-[var(--rl-size-control-${z})]`);
      expect(input).toContain(`h-[var(--rl-size-control-${z})]`);
    }
    const uno = await createGenerator({ presets: [rimelightUiPreset()] });
    const { css } = await uno.generate("h-[var(--rl-size-control-md)]", { preflights: false });
    expect(css).toContain("height:var(--rl-size-control-md)");
  });
});

describe("sized controls take their height from the control size tokens (ST3.4)", () => {
  it("Select, Textarea, InputMenu and Tabs heights reference the control size tokens", async () => {
    const { readFileSync } = await import("node:fs");
    const files = {
      select: "../src/components/select/select.theme.ts",
      textarea: "../src/components/textarea/textarea.theme.ts",
      inputMenu: "../src/components/input-menu/input-menu.theme.ts",
      tabs: "../src/components/tabs/tabs.theme.ts",
    };
    for (const [name, path] of Object.entries(files)) {
      const source = readFileSync(new URL(path, import.meta.url), "utf8");
      for (const z of ["xs", "sm", "md", "lg", "xl"]) {
        expect(source, `${name} ${z}`).toContain(`--rl-size-control-${z})]`);
      }
    }
    const uno = await createGenerator({ presets: [rimelightUiPreset()] });
    const { css } = await uno.generate("min-h-[var(--rl-size-control-md)]", { preflights: false });
    expect(css).toContain("min-height:var(--rl-size-control-md)");
  });
});
