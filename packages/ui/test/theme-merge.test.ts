import { describe, expect, it } from "vite-plus/test"
import { createGenerator } from "unocss"
import rimelightUiPreset from "../src/preset"

const uno = await createGenerator({ presets: [rimelightUiPreset()] })

describe("rimelight theme merges over wind4 defaults", () => {
  it("custom palette wins over stock static colors", async () => {
    const theme = (uno as any).config.theme
    expect(theme.colors.neutral["950"]).toBe("var(--color-neutral-950)")
  })

  it("color utilities resolve through the light-dark() chain", async () => {
    const { css } = await uno.generate("text-highlighted text-muted bg-inverted", {
      preflights: true
    })
    expect(css).toContain(".text-highlighted{color:color-mix(in srgb, var(--color-neutral-950)")
    expect(css).toMatch(/--color-neutral-950:\s*light-dark\(/)
    expect(css).not.toContain("--colors-neutral-950: oklch(14.5%")
  })

  it("spacing.md is available and does not clobber other keys", async () => {
    const theme = (uno as any).config.theme
    expect(theme.spacing.md).toBe("1rem")
    expect(theme.spacing.lg).toBe("1.125rem")
    const { css } = await uno.generate("gap-md", { preflights: false })
    expect(css).toContain("gap:var(--spacing-md)")
  })
})
