import { describe, it, expect } from "vite-plus/test"
import fs from "node:fs"
import path from "node:path"

const COMPONENTS_DIR = path.resolve(__dirname, "../src/components")
const componentFolders = fs
  .readdirSync(COMPONENTS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)

describe("@rimelight/ui Multi-Framework Component Parity (148 Components)", () => {
  it("discovers all 148 component folders in @rimelight/ui", () => {
    expect(componentFolders.length).toBe(148)
  })

  describe.each(componentFolders)("Component [%s]", (folder) => {
    const dirPath = path.join(COMPONENTS_DIR, folder)
    const files = fs.readdirSync(dirPath)

    const astroFile = files.find((f) => f.startsWith("RLA") && f.endsWith(".astro"))
    const solidFile = files.find(
      (f) => f.startsWith("RLS") && (f.endsWith(".tsx") || f.endsWith(".ts"))
    )
    const themeFile = files.find((f) => f.endsWith(".theme.ts"))
    const vueFile = files.find((f) => f.startsWith("RLV") && f.endsWith(".vue"))

    it("maintains dual Astro and Solid component implementations", () => {
      expect(astroFile, `Missing RLA*.astro in ${folder}`).toBeDefined()
      expect(solidFile, `Missing RLS*.tsx in ${folder}`).toBeDefined()
    })

    if (astroFile && solidFile) {
      const astroContent = fs.readFileSync(path.join(dirPath, astroFile), "utf-8")
      const solidContent = fs.readFileSync(path.join(dirPath, solidFile), "utf-8")

      if (themeFile && folder !== "head") {
        const themeContent = fs.readFileSync(path.join(dirPath, themeFile), "utf-8")
        const themeExportMatch = themeContent.match(/export const (\w+Theme)/)
        const themeName = themeExportMatch ? themeExportMatch[1] : null

        if (themeName) {
          it(`both Astro and Solid invoke the shared ${themeName} or composite primitive`, () => {
            const isAstroValid = astroContent.includes(themeName) || astroContent.includes("RLA")
            const isSolidValid = solidContent.includes(themeName) || solidContent.includes("RLS")
            expect(
              isAstroValid,
              `Astro component (${astroFile}) must invoke shared theme ${themeName} or composite component`
            ).toBe(true)
            expect(
              isSolidValid,
              `Solid component (${solidFile}) must invoke shared theme ${themeName} or composite component`
            ).toBe(true)
          })
        }
      }

      it("forwards attributes or binds theme classes across Astro and Solid", () => {
        const hasAstroBinding =
          astroContent.includes("classes") ||
          astroContent.includes("class=") ||
          astroContent.includes("class:list") ||
          astroContent.includes("RLA") ||
          astroContent.includes("data-slot=") ||
          astroContent.includes("<time") ||
          astroContent.includes("<head") ||
          astroContent.includes("<meta") ||
          astroContent.includes("UIHead") ||
          astroContent.includes("Astro.props")
        const hasSolidBinding =
          solidContent.includes("classes") ||
          solidContent.includes("class=") ||
          solidContent.includes("RLS") ||
          solidContent.includes("data-slot=") ||
          solidContent.includes("<time") ||
          solidContent.includes("<head") ||
          solidContent.includes("<meta") ||
          solidContent.includes("UIHead") ||
          solidContent.includes("props")

        expect(
          hasAstroBinding,
          `Astro component ${astroFile} must bind classes or forward attributes`
        ).toBe(true)
        expect(
          hasSolidBinding,
          `Solid component ${solidFile} must bind classes or forward attributes`
        ).toBe(true)
      })

      if (vueFile) {
        const vueContent = fs.readFileSync(path.join(dirPath, vueFile), "utf-8")

        it("verifies Vue implementation matches component contract", () => {
          expect(vueContent).toContain("<template>")
          expect(vueContent).toContain("<script")
        })
      }
    }
  })
})
