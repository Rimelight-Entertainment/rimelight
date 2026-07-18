import { readFileSync } from "node:fs"
import ts from "typescript"
import type { PropMeta, SlotMeta } from "@rimelight/docs"

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

  const props = extractAstroPropsFromInterface(sourceFile)

  const slots: SlotMeta[] = []
  const slotMatches = content.matchAll(/<slot(?:\s+name=["']([^"']+)["'])?/g)
  for (const match of slotMatches) {
    slots.push({ name: match[1] ?? "default", bindings: {}, description: "" })
  }
  if (!slots.length) slots.push({ name: "default", bindings: {}, description: "" })

  return { props, slots }
}
