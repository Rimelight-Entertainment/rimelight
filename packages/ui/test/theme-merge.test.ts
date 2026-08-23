import { describe, expect, it } from "vite-plus/test"
import { createGenerator } from "unocss"
import rimelightUiPreset from "../src/preset"

const uno = await createGenerator({ presets: [rimelightUiPreset()] })

describe("rimelight token architecture", () => {
  it("theme carries pointers into the canonical --rl-* namespace", () => {
    const theme = (uno as any).config.theme
    expect(theme.colors.neutral["950"]).toBe("var(--rl-neutral-950)")
    expect(theme.colors.primary.DEFAULT).toBe("var(--rl-primary-DEFAULT)")
  })

  it("preflight defines every palette/shade literal exactly once", async () => {
    const { css } = await uno.generate("text-highlighted bg-primary-500/60", { preflights: true })
    for (const k of ["50", "500", "950"]) {
      const defs = css.match(new RegExp(`--rl-primary-${k}:[^;]+;`, "g")) || []
      expect(defs.length).toBe(1)
      expect(defs[0]).toContain("light-dark(")
    }
    expect(css).not.toContain("--rl-neutral-950: oklch(14.5%")
  })

  it("utilities reference the canonical --rl-* vars directly, no --colors-* layer", async () => {
    const { css } = await uno.generate("text-highlighted text-muted bg-inverted", {
      preflights: true
    })
    expect(css).toContain(".text-highlighted{color:color-mix(in srgb, var(--rl-neutral-950)")
    expect(css).toContain(".text-muted{color:color-mix(in srgb, var(--rl-neutral-600)")
    expect(css).not.toContain("--colors-")
    expect(css).not.toContain("--rl-neutral-950: oklch(14.5%")
  })

  it("runtime consumers can rely on any --rl-* key without utilities", async () => {
    const { css } = await uno.generate("text-highlighted", { preflights: true })
    for (const k of ["50", "100", "700", "800", "900", "600", "DEFAULT"]) {
      expect(css).toContain(`--rl-primary-${k}:`)
      expect(css).toContain(`--rl-commentary-${k}:`)
    }
    expect(css).not.toContain("--rl-foreground")
  })

  it("spacing.md is available and does not clobber other keys", async () => {
    const theme = (uno as any).config.theme
    expect(theme.spacing.md).toBe("1rem")
    expect(theme.spacing.lg).toBe("1.125rem")
    const { css } = await uno.generate("gap-md", { preflights: false })
    expect(css).toContain("gap:var(--spacing-md)")
  })

  it("only the consumed compat aliases are emitted", async () => {
    const { css } = await uno.generate("text-highlighted", { preflights: true })
    expect(css).toContain("--primary: var(--rl-primary-DEFAULT)")
    expect(css).not.toContain("--secondary:")
    expect(css).not.toContain("--success:")
  })
})
