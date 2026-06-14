import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync, statSync } from "node:fs"
import { join, resolve, dirname } from "node:path"
import path from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const pathDirname = dirname(fileURLToPath(import.meta.url))
const uiRoot = resolve(pathDirname, "..")
const componentsDir = join(uiRoot, "src", "components")
const themesDir = join(uiRoot, "src", "themes")
const outputDir = join(uiRoot, "docs", "meta")

interface PropMeta {
  name: string
  type: string
  default?: string
  required: boolean
  description: string
}

interface SlotMeta {
  name: string
  bindings: Record<string, string>
  description: string
}

interface EmitMeta {
  name: string
  type: string
  description: string
}

interface ThemeMeta {
  slots: string[]
  base: Record<string, string | string[]>
  variants: Record<string, Record<string, Record<string, string | string[]>>>
  compoundVariants: Record<string, unknown>[]
  defaultVariants: Record<string, unknown>
}

interface ComponentMeta {
  name: string
  astroComponent: string | null
  vueComponent: string | null
  frameworks: ("astro" | "vue")[]
  props: PropMeta[]
  slots: SlotMeta[]
  emits: EmitMeta[]
  theme: ThemeMeta | null
}

function pascalToKebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
}

function extractScriptBlock(content: string): string | null {
  const match =
    content.match(/<script[^>]*lang=["']ts["'][^>]*>([\s\S]*?)<\/script>/) ||
    content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  return match?.[1] ?? null
}

function extractTemplateBlock(content: string): string {
  const match = content.match(/<template[^>]*>([\s\S]*?)<\/template>/)
  return match?.[1] ?? ""
}

function extractPropsFromInterface(node: ts.InterfaceDeclaration): PropMeta[] {
  const props: PropMeta[] = []
  for (const member of node.members) {
    if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
      const propName = member.name.text
      if (propName === "class" || propName.startsWith("data-")) continue
      const type = member.type ? member.type.getText().replace(/^[^:]+:\s*/, "") : "unknown"
      const isOptional = member.questionToken !== undefined
      props.push({ name: propName, type, required: !isOptional, description: "" })
    }
  }
  return props
}

function extractPropsFromTypeLiteral(
  node: ts.TypeLiteralNode,
  defaults?: Record<string, string>
): PropMeta[] {
  const props: PropMeta[] = []
  for (const member of node.members) {
    if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
      const propName = member.name.text
      if (propName === "class" || propName.startsWith("data-")) continue
      const type = member.type ? member.type.getText().replace(/^[^:]+:\s*/, "") : "unknown"
      const isOptional = member.questionToken !== undefined
      const defaultVal = defaults?.[propName]
      const prop: PropMeta = { name: propName, type, required: !isOptional, description: "" }
      if (defaultVal !== undefined) prop.default = defaultVal
      props.push(prop)
    }
  }
  return props
}

function extractVueMeta(filePath: string): {
  props: PropMeta[]
  slots: SlotMeta[]
  emits: EmitMeta[]
} {
  const content = readFileSync(filePath, "utf-8")
  const scriptContent = extractScriptBlock(content)

  const props: PropMeta[] = []
  const slots: SlotMeta[] = []
  const emits: EmitMeta[] = []

  if (scriptContent) {
    const sourceFile = ts.createSourceFile(
      "component.ts",
      scriptContent,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS
    )

    const interfaces = new Map<string, ts.InterfaceDeclaration | ts.TypeAliasDeclaration>()
    const destructuredDefaults: Record<string, string> = {}
    const imports = new Map<string, string>()

    function collectDeclarations(n: ts.Node) {
      if (ts.isInterfaceDeclaration(n) || ts.isTypeAliasDeclaration(n)) {
        interfaces.set(n.name.text, n)
      }
      if (ts.isImportDeclaration(n)) {
        const moduleSpecifier = n.moduleSpecifier
        if (ts.isStringLiteral(moduleSpecifier)) {
          const importPath = moduleSpecifier.text
          const importClause = n.importClause
          if (importClause) {
            if (importClause.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
              for (const element of importClause.namedBindings.elements) {
                imports.set(element.name.text, importPath)
              }
            }
            if (importClause.name) {
              imports.set(importClause.name.text, importPath)
            }
          }
        }
      }
      ts.forEachChild(n, collectDeclarations)
    }
    collectDeclarations(sourceFile)

    function visit(n: ts.Node) {
      if (ts.isCallExpression(n)) {
        const fnName = ts.isIdentifier(n.expression) ? n.expression.text : ""

        if (fnName === "defineProps") {
          if (n.typeArguments && n.typeArguments.length > 0) {
            const typeArg = n.typeArguments[0]!
            const refName = getTypeRefName(typeArg)
            if (refName) {
              let iface = interfaces.get(refName)
              if (!iface && imports.has(refName)) {
                const relPath = imports.get(refName)!
                const baseDir = path.dirname(filePath)
                const absolutePath = path.resolve(baseDir, relPath)
                const extensions = [".ts", ".d.ts", "/index.ts", "/index.d.ts"]
                let foundPath = ""
                if (existsSync(absolutePath) && statSync(absolutePath).isFile()) {
                  foundPath = absolutePath
                } else {
                  for (const ext of extensions) {
                    const testPath = absolutePath + ext
                    if (existsSync(testPath)) {
                      foundPath = testPath
                      break
                    }
                  }
                }
                if (foundPath) {
                  try {
                    const importContent = readFileSync(foundPath, "utf-8")
                    const importSourceFile = ts.createSourceFile(
                      "import.ts",
                      importContent,
                      ts.ScriptTarget.Latest,
                      true,
                      ts.ScriptKind.TS
                    )
                    let foundNode: ts.InterfaceDeclaration | ts.TypeAliasDeclaration | null = null
                    function findDecl(innerNode: ts.Node) {
                      if (
                        (ts.isInterfaceDeclaration(innerNode) || ts.isTypeAliasDeclaration(innerNode)) &&
                        innerNode.name.text === refName
                      ) {
                        foundNode = innerNode
                      }
                      ts.forEachChild(innerNode, findDecl)
                    }
                    findDecl(importSourceFile)
                    if (foundNode) {
                      iface = foundNode
                    }
                  } catch (e) {}
                }
              }

              if (iface) {
                let extracted: PropMeta[] = []
                if (ts.isInterfaceDeclaration(iface)) {
                  extracted = extractPropsFromInterface(iface)
                } else if (ts.isTypeAliasDeclaration(iface) && ts.isTypeLiteralNode(iface.type)) {
                  extracted = extractPropsFromTypeLiteral(iface.type)
                }
                props.push(...extracted)
              }
            } else if (ts.isTypeLiteralNode(typeArg)) {
              props.push(...extractPropsFromTypeLiteral(typeArg))
            }
          } else if (n.arguments.length > 0 && ts.isTypeLiteralNode(n.arguments[0]!)) {
            props.push(...extractPropsFromTypeLiteral(n.arguments[0]))
          }
        }

        if (fnName === "withDefaults" && n.arguments.length > 0) {
          const callArg = n.arguments[0]!
          if (
            ts.isCallExpression(callArg) &&
            ts.isIdentifier(callArg.expression) &&
            callArg.expression.text === "defineProps"
          ) {
            const defaultsObj = n.arguments[1]!
            const defaults: Record<string, string> = {}
            if (ts.isObjectLiteralExpression(defaultsObj)) {
              for (const p of defaultsObj.properties) {
                if (ts.isPropertyAssignment(p) && ts.isIdentifier(p.name)) {
                  defaults[p.name.text] = p.initializer.getText()
                }
              }
            }
            if (callArg.typeArguments && callArg.typeArguments.length > 0) {
              const typeArg = callArg.typeArguments[0]!
              const refName = getTypeRefName(typeArg)
              if (refName) {
                let iface = interfaces.get(refName)
                if (!iface && imports.has(refName)) {
                  const relPath = imports.get(refName)!
                  const baseDir = path.dirname(filePath)
                  const absolutePath = path.resolve(baseDir, relPath)
                  const extensions = [".ts", ".d.ts", "/index.ts", "/index.d.ts"]
                  let foundPath = ""
                  if (existsSync(absolutePath) && statSync(absolutePath).isFile()) {
                    foundPath = absolutePath
                  } else {
                    for (const ext of extensions) {
                      const testPath = absolutePath + ext
                      if (existsSync(testPath)) {
                        foundPath = testPath
                        break
                      }
                    }
                  }
                  if (foundPath) {
                    try {
                      const importContent = readFileSync(foundPath, "utf-8")
                      const importSourceFile = ts.createSourceFile(
                        "import.ts",
                        importContent,
                        ts.ScriptTarget.Latest,
                        true,
                        ts.ScriptKind.TS
                      )
                      let foundNode: ts.InterfaceDeclaration | ts.TypeAliasDeclaration | null = null
                      function findDecl(innerNode: ts.Node) {
                        if (
                          (ts.isInterfaceDeclaration(innerNode) || ts.isTypeAliasDeclaration(innerNode)) &&
                          innerNode.name.text === refName
                        ) {
                          foundNode = innerNode
                        }
                        ts.forEachChild(innerNode, findDecl)
                      }
                      findDecl(importSourceFile)
                      if (foundNode) {
                        iface = foundNode
                      }
                    } catch (e) {}
                  }
                }

                if (iface) {
                  let baseProps: PropMeta[] = []
                  if (ts.isInterfaceDeclaration(iface)) {
                    baseProps = extractPropsFromInterface(iface)
                  } else if (ts.isTypeAliasDeclaration(iface) && ts.isTypeLiteralNode(iface.type)) {
                    baseProps = extractPropsFromTypeLiteral(iface.type)
                  }
                  for (const p of baseProps) {
                    const d = defaults[p.name]
                    if (d !== undefined) p.default = d
                  }
                  props.push(...baseProps)
                }
              } else if (ts.isTypeLiteralNode(typeArg)) {
                props.push(...extractPropsFromTypeLiteral(typeArg, defaults))
              }
            } else if (
              callArg.arguments.length > 0 &&
              ts.isTypeLiteralNode(callArg.arguments[0]!)
            ) {
              props.push(...extractPropsFromTypeLiteral(callArg.arguments[0], defaults))
            }
          }
        }

        if (fnName === "defineSlots" && n.arguments.length > 0) {
          const arg = n.arguments[0]!
          if (ts.isTypeLiteralNode(arg)) {
            for (const member of arg.members) {
              if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
                const bindings: Record<string, string> = {}
                if (member.type && ts.isFunctionTypeNode(member.type)) {
                  for (const param of member.type.parameters) {
                    if (param.type && ts.isTypeLiteralNode(param.type)) {
                      for (const pm of param.type.members) {
                        if (
                          ts.isPropertySignature(pm) &&
                          pm.name &&
                          ts.isIdentifier(pm.name) &&
                          pm.type
                        ) {
                          bindings[pm.name.text] = pm.type.getText()
                        }
                      }
                    }
                  }
                }
                slots.push({ name: member.name.text, bindings, description: "" })
              }
            }
          }
        }

        if (fnName === "defineEmits" && n.arguments.length > 0) {
          const arg = n.arguments[0]!
          if (ts.isTypeLiteralNode(arg)) {
            for (const member of arg.members) {
              if (
                ts.isPropertySignature(member) &&
                member.name &&
                ts.isIdentifier(member.name) &&
                member.type
              ) {
                let payloadType = "void"
                if (ts.isFunctionTypeNode(member.type) && member.type.parameters.length > 0) {
                  const param = member.type.parameters[0]
                  if (param?.type) payloadType = param.type.getText()
                }
                emits.push({ name: member.name.text, type: payloadType, description: "" })
              }
            }
          }
        }
      }
      ts.forEachChild(n, visit)
    }

    visit(sourceFile)
  }

  const templateContent = extractTemplateBlock(content)
  const slotMatches = templateContent.matchAll(/<slot(?:\s+name=["']([^"']+)["'])?/g)
  for (const match of slotMatches) {
    const slotName = match[1] ?? "default"
    if (!slots.some((s) => s.name === slotName)) {
      slots.push({ name: slotName, bindings: {}, description: "" })
    }
  }
  if (!slots.length) slots.push({ name: "default", bindings: {}, description: "" })

  return { props, slots, emits }
}

function extractAstroMeta(filePath: string): { props: PropMeta[]; slots: SlotMeta[] } {
  const content = readFileSync(filePath, "utf-8")
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatterMatch) return { props: [], slots: [] }

  const frontmatter = frontmatterMatch[1]!
  const sourceFile = ts.createSourceFile(
    "component.ts",
    frontmatter,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  )

  const props: PropMeta[] = []
  const slots: SlotMeta[] = []

  function visit(n: ts.Node) {
    if (
      (ts.isInterfaceDeclaration(n) || ts.isTypeAliasDeclaration(n)) &&
      n.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      const name = n.name.text
      if (name.endsWith("Props") || name === "Props") {
        if (ts.isInterfaceDeclaration(n)) {
          for (const member of n.members) {
            if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
              const propName = member.name.text
              if (propName === "class" || propName.startsWith("data-")) continue
              const type = member.type ? member.type.getText().replace(/^[^:]+:\s*/, "") : "unknown"
              const isOptional = member.questionToken !== undefined
              props.push({ name: propName, type, required: !isOptional, description: "" })
            }
          }
        } else if (ts.isTypeAliasDeclaration(n) && ts.isTypeLiteralNode(n.type)) {
          for (const member of n.type.members) {
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
    ts.forEachChild(n, visit)
  }

  visit(sourceFile)

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

function extractThemeMeta(componentName: string): ThemeMeta | null {
  const themeFiles = readdirSync(themesDir).filter((f) => f.endsWith(".theme.ts"))

  let themePath: string | null = null
  for (const file of themeFiles) {
    const baseName = file.replace(".theme.ts", "")
    if (baseName === componentName.toLowerCase()) {
      themePath = join(themesDir, file)
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

async function extractAll(): Promise<Record<string, ComponentMeta>> {
  const vueDir = join(componentsDir, "vue")
  const astroDir = join(componentsDir, "astro")

  const vueFiles = existsSync(vueDir) ? readdirSync(vueDir).filter((f) => f.endsWith(".vue")) : []
  const astroFiles = existsSync(astroDir)
    ? readdirSync(astroDir).filter((f) => f.endsWith(".astro") && !["Head.astro"].includes(f))
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
        const vueMeta = extractVueMeta(join(vueDir, vueFile))
        props = vueMeta.props
        slots = vueMeta.slots
        emits = vueMeta.emits
      } catch (err) {
        console.warn(`Failed to extract Vue meta for ${vueFile}:`, err)
      }
    }

    if (astroFile) {
      frameworks.push("astro")
      if (!vueFile) {
        try {
          const astroMeta = extractAstroMeta(join(astroDir, astroFile))
          props = astroMeta.props
          slots = astroMeta.slots
        } catch (err) {
          console.warn(`Failed to extract Astro meta for ${astroFile}:`, err)
        }
      }
    }

    const theme = extractThemeMeta(name)

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

async function main() {
  console.log("Extracting component metadata...")
  const meta = await extractAll()

  mkdirSync(outputDir, { recursive: true })
  const outputPath = join(outputDir, "component-meta.json")
  writeFileSync(outputPath, JSON.stringify(meta, null, 2), "utf-8")

  console.log(`Extracted metadata for ${Object.keys(meta).length} components`)
  console.log(`Output: ${outputPath}`)

  return meta
}

main().catch(console.error)

export default main
