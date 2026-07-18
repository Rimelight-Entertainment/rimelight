import { existsSync, readdirSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import type { ComponentMeta, PropMeta, SlotMeta, EmitMeta } from "./types"
import { extractAstroMeta } from "./extractors/extractAstro"
import { extractVueMeta } from "./extractors/extractVue"
import { extractThemeMeta } from "./extractors/extractTheme"

const pathDirname = path.dirname(fileURLToPath(import.meta.url))
const uiRoot = path.resolve(pathDirname, "..", "..", "..", "ui")

function pascalToKebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
}

function getComponentNameFromFilename(filename: string): string {
  return filename.replace(/^(RLA|RLV)/, "").replace(/\.(astro|vue)$/, "")
}

export async function extractAllMeta(): Promise<Record<string, ComponentMeta>> {
  const componentsDir = path.join(uiRoot, "src", "components")

  const vueComponents = new Map<string, { folder: string; filename: string }>()
  const astroComponents = new Map<string, { folder: string; filename: string }>()

  if (existsSync(componentsDir)) {
    const folders = readdirSync(componentsDir)
    for (const folder of folders) {
      const folderPath = path.join(componentsDir, folder)
      if (statSync(folderPath).isDirectory()) {
        const files = readdirSync(folderPath)
        for (const f of files) {
          if (f.endsWith(".vue") && f.startsWith("RLV")) {
            const compName = getComponentNameFromFilename(f)
            vueComponents.set(compName, { folder, filename: f })
          } else if (f.endsWith(".astro") && f.startsWith("RLA") && f !== "Head.astro") {
            const compName = getComponentNameFromFilename(f)
            astroComponents.set(compName, { folder, filename: f })
          }
        }
      }
    }
  }

  const allNames = new Set([...vueComponents.keys(), ...astroComponents.keys()])
  const result: Record<string, ComponentMeta> = {}

  await Promise.all(
    [...allNames].toSorted().map(async (name) => {
      const vue = vueComponents.get(name)
      const astro = astroComponents.get(name)

      let props: PropMeta[] = []
      let slots: SlotMeta[] = []
      let emits: EmitMeta[] = []
      const frameworks: ("astro" | "vue")[] = []

      if (vue) {
        frameworks.push("vue")
        try {
          const vueMeta = extractVueMeta(path.join(componentsDir, vue.folder, vue.filename))
          props = vueMeta.props
          slots = vueMeta.slots
          emits = vueMeta.emits
        } catch (err) {
          console.warn(`[docs] Failed to extract Vue meta for ${vue.filename}:`, err)
        }
      }

      if (astro) {
        frameworks.push("astro")
        if (!vue) {
          try {
            const astroMeta = extractAstroMeta(
              path.join(componentsDir, astro.folder, astro.filename)
            )
            props = astroMeta.props
            slots = astroMeta.slots
          } catch (err) {
            console.warn(`[docs] Failed to extract Astro meta for ${astro.filename}:`, err)
          }
        }
      }

      const theme = await extractThemeMeta(name, componentsDir)

      result[pascalToKebab(name)] = {
        name,
        astroComponent: astro ? astro.filename : null,
        vueComponent: vue ? vue.filename : null,
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
