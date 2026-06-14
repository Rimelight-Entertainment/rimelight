import { existsSync, readdirSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import type { ComponentMeta, PropMeta, SlotMeta, EmitMeta } from "./types"
import { extractAstroMeta } from "./extractors/extractAstro"
import { extractVueMeta } from "./extractors/extractVue"
import { extractThemeMeta } from "./extractors/extractTheme"

const pathDirname = path.dirname(fileURLToPath(import.meta.url))
const uiRoot = path.resolve(pathDirname, "..", "..")

function pascalToKebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
}

function getComponentNameFromFilename(filename: string): string {
  return filename.replace(/^(RLA|RLV)/, "").replace(/\.(astro|vue)$/, "")
}

export async function extractAllMeta(): Promise<Record<string, ComponentMeta>> {
  const componentsDir = path.join(uiRoot, "src", "components")
  const themesDir = path.join(uiRoot, "src", "themes")

  const vueDir = path.join(componentsDir, "vue")
  const astroDir = path.join(componentsDir, "astro")

  const vueFiles = existsSync(vueDir)
    ? readdirSync(vueDir).filter((f: string) => f.endsWith(".vue"))
    : []
  const astroFiles = existsSync(astroDir)
    ? readdirSync(astroDir).filter((f: string) => f.endsWith(".astro") && f !== "Head.astro")
    : []

  const vueComponents = new Map<string, string>()
  const astroComponents = new Map<string, string>()

  for (const f of vueFiles) vueComponents.set(getComponentNameFromFilename(f), f)
  for (const f of astroFiles) astroComponents.set(getComponentNameFromFilename(f), f)

  const allNames = new Set([...vueComponents.keys(), ...astroComponents.keys()])
  const result: Record<string, ComponentMeta> = {}

  for (const name of [...allNames].toSorted()) {
    const vueFile = vueComponents.get(name)
    const astroFile = astroComponents.get(name)

    let props: PropMeta[] = []
    let slots: SlotMeta[] = []
    let emits: EmitMeta[] = []
    const frameworks: ("astro" | "vue")[] = []

    if (vueFile) {
      frameworks.push("vue")
      try {
        const vueMeta = extractVueMeta(path.join(vueDir, vueFile))
        props = vueMeta.props
        slots = vueMeta.slots
        emits = vueMeta.emits
      } catch (err) {
        console.warn(`[docs] Failed to extract Vue meta for ${vueFile}:`, err)
      }
    }

    if (astroFile) {
      frameworks.push("astro")
      if (!vueFile) {
        try {
          const astroMeta = extractAstroMeta(path.join(astroDir, astroFile))
          props = astroMeta.props
          slots = astroMeta.slots
        } catch (err) {
          console.warn(`[docs] Failed to extract Astro meta for ${astroFile}:`, err)
        }
      }
    }

    const theme = await extractThemeMeta(name, themesDir)

    result[pascalToKebab(name)] = {
      name,
      astroComponent: astroFile ?? null,
      vueComponent: vueFile ?? null,
      frameworks,
      props,
      slots,
      emits,
      theme
    }
  }

  return result
}
