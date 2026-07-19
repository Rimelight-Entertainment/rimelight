import { existsSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import ts from "typescript"
import type { PropMeta, SlotMeta } from "@rimelight/docs"

function extractPropsFromProperties(members: ts.NodeArray<ts.TypeElement>): PropMeta[] {
  const props: PropMeta[] = []
  for (const member of members) {
    if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
      const propName = member.name.text
      if (propName === "class" || propName.startsWith("data-")) continue
      const type = member.type ? member.type.getText() : "unknown"
      const isOptional = member.questionToken !== undefined
      props.push({ name: propName, type, required: !isOptional, description: "" })
    }
  }
  return props
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
          props.push(...extractPropsFromProperties(node.members))
        } else if (ts.isTypeAliasDeclaration(node) && ts.isTypeLiteralNode(node.type)) {
          props.push(...extractPropsFromProperties(node.type.members))
        }
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return props
}

function collectImports(sourceFile: ts.SourceFile): Map<string, string> {
  const imports = new Map<string, string>()
  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier
      if (ts.isStringLiteral(moduleSpecifier)) {
        const importPath = moduleSpecifier.text
        const importClause = node.importClause
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
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return imports
}

function resolveImportedType(
  typeName: string,
  imports: Map<string, string>,
  filePath: string
): ts.InterfaceDeclaration | ts.TypeAliasDeclaration | null {
  const relPath = imports.get(typeName)
  if (!relPath) return null

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

  if (!foundPath) return null

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
    function findDecl(n: ts.Node) {
      if (
        (ts.isInterfaceDeclaration(n) || ts.isTypeAliasDeclaration(n)) &&
        n.name.text === typeName
      ) {
        foundNode = n
      }
      ts.forEachChild(n, findDecl)
    }
    findDecl(importSourceFile)
    return foundNode
  } catch {
    return null
  }
}

function resolvePropsFromNode(node: ts.InterfaceDeclaration | ts.TypeAliasDeclaration): PropMeta[] {
  if (ts.isInterfaceDeclaration(node)) {
    return extractPropsFromProperties(node.members)
  }
  if (ts.isTypeAliasDeclaration(node) && ts.isTypeLiteralNode(node.type)) {
    return extractPropsFromProperties(node.type.members)
  }
  return []
}

function extractAstroPropsFromCast(
  sourceFile: ts.SourceFile,
  imports: Map<string, string>,
  filePath: string
): PropMeta[] {
  const props: PropMeta[] = []
  const resolved = new Set<string>()

  function resolve(refName: string) {
    if (resolved.has(refName)) return
    resolved.add(refName)
    const declaration = resolveImportedType(refName, imports, filePath)
    if (declaration) {
      props.push(...resolvePropsFromNode(declaration))
    }
  }

  function visit(node: ts.Node) {
    if (ts.isAsExpression(node)) {
      if (ts.isIntersectionTypeNode(node.type)) {
        for (const type of node.type.types) {
          if (ts.isTypeReferenceNode(type) && ts.isIdentifier(type.typeName)) {
            resolve(type.typeName.text)
          } else if (ts.isTypeLiteralNode(type)) {
            props.push(...extractPropsFromProperties(type.members))
          }
        }
      } else if (ts.isTypeReferenceNode(node.type) && ts.isIdentifier(node.type.typeName)) {
        resolve(node.type.typeName.text)
      } else if (ts.isTypeLiteralNode(node.type)) {
        props.push(...extractPropsFromProperties(node.type.members))
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return props
}

export function extractAstroMeta(filePath: string): { props: PropMeta[]; slots: SlotMeta[] } {
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

  const imports = collectImports(sourceFile)
  const props = extractAstroPropsFromInterface(sourceFile)
  if (props.length === 0 && imports.size > 0) {
    props.push(...extractAstroPropsFromCast(sourceFile, imports, filePath))
  }

  const slots: SlotMeta[] = []
  const slotMatches = content.matchAll(/<slot(?:\s+name=["']([^"']+)["'])?/g)
  for (const match of slotMatches) {
    slots.push({ name: match[1] ?? "default", bindings: {}, description: "" })
  }
  if (!slots.length) slots.push({ name: "default", bindings: {}, description: "" })

  // Deduplicate props and slots by name
  const uniquePropsMap = new Map<string, PropMeta>()
  for (const p of props) {
    uniquePropsMap.set(p.name, p)
  }

  const uniqueSlotsMap = new Map<string, SlotMeta>()
  for (const s of slots) {
    uniqueSlotsMap.set(s.name, s)
  }

  return {
    props: Array.from(uniquePropsMap.values()),
    slots: Array.from(uniqueSlotsMap.values())
  }
}
