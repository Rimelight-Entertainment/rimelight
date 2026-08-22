import { describe, expect, it } from "vite-plus/test"
import { createGenerator } from "unocss"
import rimelightUiPreset from "../src/preset"

const uno = await createGenerator({ presets: [rimelightUiPreset()] })

describe("rimelight theme shares the wind4 --colors-* namespace", () => {
  it("theme carries literal light-dark() values, not pointers", () => {
    const theme = (uno as any).config.theme
    expect(theme.colors.neutral["950"]).toMatch(/^light-dark\(/)
    expect(theme.colors.primary.DEFAULT).toMatch(/^light-dark\(/)
  })

  it("utilities reference --colors-* which resolve to light-dark()", async () => {
    const { css } = await uno.generate("text-highlighted text-muted bg-inverted", {
      preflights: true
    })
    expect(css).toContain(".text-highlighted{color:color-mix(in srgb, var(--colors-neutral-950)")
    expect(css.match(/--colors-neutral-950:[^;]+/g)?.every((v) => v.includes("light-dark("))).toBe(
      true
    )
    expect(css).not.toContain("--colors-neutral-950: oklch(14.5%")
  })

  it("preflight emits every shade so non-utility consumers always resolve", async () => {
    const { css } = await uno.generate("text-highlighted", { preflights: true })
    for (const shade of ["50", "500", "600", "950"]) {
      expect(css).toContain(`--colors-primary-${shade}: light-dark(`)
    }
  })

  it("spacing.md is available and does not clobber other keys", async () => {
    const theme = (uno as any).config.theme
    expect(theme.spacing.md).toBe("1rem")
    expect(theme.spacing.lg).toBe("1.125rem")
    const { css } = await uno.generate("gap-md", { preflights: false })
    expect(css).toContain("gap:var(--spacing-md)")
  })

  it("singular aliases still point at the shared tokens", async () => {
    const { css } = await uno.generate("text-highlighted", { preflights: true })
    expect(css).toContain("--primary: var(--colors-primary-DEFAULT)")
  })
})
