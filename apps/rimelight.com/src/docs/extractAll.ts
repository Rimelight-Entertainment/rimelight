import { existsSync, readdirSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import type { ComponentMeta, PropMeta, SlotMeta, EmitMeta } from "@rimelight/docs"
import { extractAstroMeta } from "./extractors/extractAstro"
import { extractAllThemesMeta } from "./extractors/extractTheme"

const pathDirname = path.dirname(fileURLToPath(import.meta.url))
const uiRoot = path.resolve(pathDirname, "..", "..", "..", "..", "packages", "ui")

function pascalToKebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
}

function getComponentNameFromFilename(filename: string): string {
  return filename.replace(/^(RLA|RLS)/, "").replace(/\.(astro|tsx)$/, "")
}

export async function extractAllMeta(): Promise<Record<string, ComponentMeta>> {
  const componentsDir = path.join(uiRoot, "src", "components")

  const astroComponents = new Map<string, { folder: string; filename: string }>()
  const solidComponents = new Map<string, { folder: string; filename: string }>()

  if (existsSync(componentsDir)) {
    const folders = readdirSync(componentsDir)
    for (const folder of folders) {
      const folderPath = path.join(componentsDir, folder)
      if (statSync(folderPath).isDirectory()) {
        const files = readdirSync(folderPath)
        for (const f of files) {
          if (f.endsWith(".tsx") && f.startsWith("RLS")) {
            const compName = getComponentNameFromFilename(f)
            solidComponents.set(compName, { folder, filename: f })
          } else if (f.endsWith(".astro") && f.startsWith("RLA") && f !== "Head.astro") {
            const compName = getComponentNameFromFilename(f)
            astroComponents.set(compName, { folder, filename: f })
          }
        }
      }
    }
  }

  const allNames = new Set([...solidComponents.keys(), ...astroComponents.keys()])
  const sortedNames = [...allNames].toSorted()

  const themesMap = await extractAllThemesMeta(sortedNames, componentsDir)
  const result: Record<string, ComponentMeta> = {}

  await Promise.all(
    sortedNames.map(async (name) => {
      const solid = solidComponents.get(name)
      const astro = astroComponents.get(name)

      let props: PropMeta[] = []
      let slots: SlotMeta[] = []
      let emits: EmitMeta[] = []
      const frameworks: ("astro" | "solid")[] = []

      if (solid) {
        frameworks.push("solid")
      }

      if (astro) {
        frameworks.push("astro")
        try {
          const astroMeta = extractAstroMeta(path.join(componentsDir, astro.folder, astro.filename))
          props = astroMeta.props
          slots = astroMeta.slots
        } catch (err) {
          console.warn(`[docs] Failed to extract Astro meta for ${astro.filename}:`, err)
        }
      }

      const theme = themesMap[name] || null

      result[pascalToKebab(name)] = {
        name,
        astroComponent: astro ? astro.filename : null,
        solidComponent: solid ? solid.filename : null,
        frameworks,
        props,
        slots,
        emits,
        theme
      }
    })
  )

  return result
}
