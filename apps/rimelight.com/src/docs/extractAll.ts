import { existsSync, readdirSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import type { ComponentMeta, PropMeta, SlotMeta, EmitMeta } from "./types.ts"
import { extractAllThemesMeta } from "./extractors/extractTheme"

const pathDirname = path.dirname(fileURLToPath(import.meta.url))
const uiRoot = path.resolve(pathDirname, "..", "..", "..", "..", "packages", "ui")

function pascalToKebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
}

function getComponentNameFromFilename(filename: string): string {
  return filename.replace(/^RL/, "").replace(/\.(astro|tsx)$/, "")
}

export async function extractAllMeta(): Promise<Record<string, ComponentMeta>> {
  const componentsDir = path.join(uiRoot, "src", "components")

  const solidComponents = new Map<string, { folder: string; filename: string }>()

  if (existsSync(componentsDir)) {
    const folders = readdirSync(componentsDir)
    for (const folder of folders) {
      const folderPath = path.join(componentsDir, folder)
      if (statSync(folderPath).isDirectory()) {
        const files = readdirSync(folderPath)
        for (const f of files) {
          if (f.endsWith(".tsx") && f.startsWith("RL") && !f.endsWith(".theme.ts")) {
            const compName = getComponentNameFromFilename(f)
            solidComponents.set(compName, { folder, filename: f })
          }
        }
      }
    }
  }

  const allNames = new Set(solidComponents.keys())
  const sortedNames = [...allNames].toSorted()

  const themesMap = await extractAllThemesMeta(sortedNames, componentsDir)
  const result: Record<string, ComponentMeta> = {}

  await Promise.all(
    sortedNames.map(async (name) => {
      const solid = solidComponents.get(name)

      let props: PropMeta[] = []
      let slots: SlotMeta[] = []
      let emits: EmitMeta[] = []
      const frameworks: "solid"[] = ["solid"]

      const theme = themesMap[name] || null

      result[pascalToKebab(name)] = {
        name,
        astroComponent: null,
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
