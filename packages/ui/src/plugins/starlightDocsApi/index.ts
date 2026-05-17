import type { AstroIntegration } from "astro"
import virtual from "vite-plugin-virtual"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { readFileSync, existsSync, readdirSync } from "node:fs"
import ts from "typescript"
import type { ComponentMeta, PropMeta, SlotMeta, EmitMeta, ThemeMeta } from "./types"
import { extractVueMetaDirect } from "./extract-vue"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uiRoot = path.resolve(__dirname, "..", "..", "..")

function pascalToKebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
}

function extractAstroPropsFromInterface(sourceFile: ts.SourceFile): PropMeta[] {
  const props: PropMeta[] = []

  function visit(node: ts.Node) {
    if (
      (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      const name = node.name.text
      if (name.endsWith("Props") || name === "Props") {
        if (ts.isInterfaceDeclaration(node)) {
          for (const member of node.members) {
            if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
              const propName = member.name.text
              if (propName === "class" || propName.startsWith("data-")) continue
              const type = member.type ? member.type.getText().replace(/^[^:]+:\s*/, "") : "unknown"
              const isOptional = member.questionToken !== undefined
              props.push({ name: propName, type, required: !isOptional, description: "" })
            }
          }
        } else if (ts.isTypeAliasDeclaration(node) && ts.isTypeLiteralNode(node.type)) {
          for (const member of node.type.members) {
            if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
              const propName = member.name.text
              if (propName === "class" || propName.startsWith("data-")) continue
              const type = member.type ? member.type.getText().replace(/^[^:]+:\s*/, "") : "unknown"
              const isOptional = member.questionToken !== undefined
              props.push({ name: propName, type, required: !isOptional, description: "" })
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return props
}

function extractAstroMeta(filePath: string): { props: PropMeta[]; slots: SlotMeta[] } {
  const content = readFileSync(filePath, "utf-8")
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatterMatch) return { props: [], slots: [] }

  const frontmatter = frontmatterMatch[1]
  const sourceFile = ts.createSourceFile(
    "component.ts",
    frontmatter ?? "",
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  )

  const props = extractAstroPropsFromInterface(sourceFile)

  const slots: SlotMeta[] = []
  const slotMatches = content.matchAll(/<slot(?:\s+name=["']([^"']+)["'])?/g)
  for (const match of slotMatches) {
    slots.push({ name: match[1] ?? "default", bindings: {}, description: "" })
  }
  if (!slots.length) slots.push({ name: "default", bindings: {}, description: "" })

  return { props, slots }
}

function safeParse(code: string): unknown {
  try {
    const normalized = code
      .replace(/'/g, '"')
      .replace(/,\s*\}/g, "}")
      .replace(/,\s*\]/g, "]")
    return JSON.parse(normalized)
  } catch {
    return {}
  }
}

function isStringOrArray(value: unknown): value is string | string[] {
  return typeof value === "string" || Array.isArray(value)
}

function isStringRecord(value: unknown): value is Record<string, string | string[]> {
  if (typeof value !== "object" || value === null) return false
  return Object.values(value).every(isStringOrArray)
}

function isVariantRecord(
  value: unknown
): value is Record<string, Record<string, Record<string, string | string[]>>> {
  if (typeof value !== "object" || value === null) return false
  return Object.values(value).every(
    (v) => typeof v === "object" && v !== null && Object.values(v).every(isStringRecord)
  )
}

function isCompoundArray(value: unknown): value is Record<string, unknown>[] {
  return Array.isArray(value) && value.every((v) => typeof v === "object" && v !== null)
}

function isDefaultVariants(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function extractThemeMeta(componentName: string, themesDir: string): ThemeMeta | null {
  if (!existsSync(themesDir)) return null

  const themeFiles = readdirSync(themesDir).filter((f) => f.endsWith(".theme.ts"))
  let themePath: string | null = null
  for (const file of themeFiles) {
    const baseName = file.replace(".theme.ts", "")
    if (baseName === componentName.toLowerCase()) {
      themePath = path.join(themesDir, file)
      break
    }
  }

  if (!themePath || !existsSync(themePath)) return null

  const content = readFileSync(themePath, "utf-8")
  const slotsMatch = content.match(/slots:\s*\[([^\]]*)\]/)
  const baseMatch = content.match(/base:\s*(\{[\s\S]*?\n[ \t]*\})/)
  const variantsMatch = content.match(/variants:\s*(\{[\s\S]*?\n[ \t]*\})/)
  const compoundMatch = content.match(/compoundVariants:\s*(\[[\s\S]*?\n[ \t]*\])/)
  const defaultVariantsMatch = content.match(/defaultVariants:\s*(\{[\s\S]*?\n[ \t]*\})/)

  const slots = slotsMatch
    ? slotsMatch[1]!
        .split(",")
        .map((s) => s.trim().replace(/["']/g, ""))
        .filter(Boolean)
    : []

  const parsedBase = baseMatch ? safeParse(baseMatch[1]!) : {}
  const parsedVariants = variantsMatch ? safeParse(variantsMatch[1]!) : {}
  const parsedCompound = compoundMatch ? safeParse(compoundMatch[1]!) : []
  const parsedDefaults = defaultVariantsMatch ? safeParse(defaultVariantsMatch[1]!) : {}

  return {
    slots,
    base: isStringRecord(parsedBase) ? parsedBase : {},
    variants: isVariantRecord(parsedVariants) ? parsedVariants : {},
    compoundVariants: isCompoundArray(parsedCompound) ? parsedCompound : [],
    defaultVariants: isDefaultVariants(parsedDefaults) ? parsedDefaults : {}
  }
}

function getComponentNameFromFilename(filename: string): string {
  return filename.replace(/^(RLA|RLV)/, "").replace(/\.(astro|vue)$/, "")
}

function extractAllMeta(): Record<string, ComponentMeta> {
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
        const vueMeta = extractVueMetaDirect(path.join(vueDir, vueFile))
        props = vueMeta.props
        slots = vueMeta.slots
        emits = vueMeta.emits
      } catch (err) {
        console.warn(`[starlightDocsApi] Failed to extract Vue meta for ${vueFile}:`, err)
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
          console.warn(`[starlightDocsApi] Failed to extract Astro meta for ${astroFile}:`, err)
        }
      }
    }

    const theme = extractThemeMeta(name, themesDir)

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

export interface StarlightDocsApiConfig {}

export default function starlightDocsApi(_config?: StarlightDocsApiConfig): AstroIntegration {
  return {
    name: "rimelight-ui-starlight-docs-api",
    hooks: {
      "astro:config:setup": ({ updateConfig, logger }) => {
        logger.info("Initializing @rimelight/ui docs API")

        const meta = extractAllMeta()

        updateConfig({
          vite: {
            plugins: [
              virtual({
                "virtual:rimelight-ui-docs-meta": `export default ${JSON.stringify(meta)}`
              })
            ]
          }
        } as Record<string, unknown>)
      }
    }
  }
}
