import { readFileSync } from "node:fs"
import ts from "typescript"
import type { PropMeta, SlotMeta, EmitMeta } from "./types"

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

function getJSDocDescription(node: ts.Node): string {
  const jsDocs = ts.getJSDocCommentsAndTags(node)
  if (jsDocs.length === 0) return ""

  const comment = jsDocs[0]
  if (comment && ts.isJSDoc(comment)) {
    const text = comment.comment
    if (typeof text === "string") return text.trim()
    if (Array.isArray(text))
      return text
        .map((t) => (typeof t === "string" ? t : t.text))
        .join(" ")
        .trim()
  }
  return ""
}

function extractPropsFromInterface(node: ts.InterfaceDeclaration): PropMeta[] {
  const props: PropMeta[] = []
  for (const member of node.members) {
    if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
      const propName = member.name.text
      if (propName === "class" || propName.startsWith("data-")) continue
      const type = member.type ? member.type.getText().replace(/^[^:]+:\s*/, "") : "unknown"
      const isOptional = member.questionToken !== undefined
      const description = getJSDocDescription(member)
      props.push({ name: propName, type, required: !isOptional, description })
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

function getTypeRefName(typeArg: ts.TypeNode): string | null {
  if (ts.isTypeReferenceNode(typeArg) && ts.isIdentifier(typeArg.typeName)) {
    return typeArg.typeName.text
  }
  return null
}

export function extractVueMetaDirect(filePath: string): {
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

    const interfaces = new Map<string, ts.InterfaceDeclaration>()
    const destructuredDefaults: Record<string, string> = {}

    function collectDeclarations(node: ts.Node) {
      if (ts.isInterfaceDeclaration(node)) {
        interfaces.set(node.name.text, node)
      }
      if (ts.isVariableStatement(node)) {
        for (const decl of node.declarationList.declarations) {
          if (
            decl.initializer &&
            ts.isCallExpression(decl.initializer) &&
            ts.isObjectBindingPattern(decl.name)
          ) {
            const expr = decl.initializer.expression
            const fnName = ts.isIdentifier(expr) ? expr.text : ""
            if (fnName === "defineProps") {
              for (const element of decl.name.elements) {
                if (
                  ts.isBindingElement(element) &&
                  ts.isIdentifier(element.name) &&
                  element.initializer
                ) {
                  destructuredDefaults[element.name.text] = element.initializer.getText()
                }
              }
            }
          }
        }
      }
      ts.forEachChild(node, collectDeclarations)
    }
    collectDeclarations(sourceFile)

    function visit(node: ts.Node) {
      if (ts.isCallExpression(node)) {
        const expr = node.expression
        const fnName = ts.isIdentifier(expr) ? expr.text : ""

        if (fnName === "defineProps") {
          if (node.typeArguments && node.typeArguments.length > 0) {
            const typeArg = node.typeArguments[0]!
            const refName = getTypeRefName(typeArg)
            if (refName) {
              const iface = interfaces.get(refName)
              if (iface) {
                const extracted = extractPropsFromInterface(iface)
                for (const p of extracted) {
                  const d = destructuredDefaults[p.name]
                  if (d !== undefined) p.default = d
                }
                props.push(...extracted)
              }
            } else if (ts.isTypeLiteralNode(typeArg)) {
              props.push(...extractPropsFromTypeLiteral(typeArg))
            }
          } else if (node.arguments.length > 0) {
            const arg = node.arguments[0]!
            if (ts.isTypeLiteralNode(arg)) {
              props.push(...extractPropsFromTypeLiteral(arg))
            }
          }
        }

        if (fnName === "withDefaults" && node.arguments.length > 0) {
          const callArg = node.arguments[0]!
          if (ts.isCallExpression(callArg)) {
            const innerFn = ts.isIdentifier(callArg.expression) ? callArg.expression.text : ""
            if (innerFn === "defineProps") {
              const defaultsObj = node.arguments[1]!
              const defaults: Record<string, string> = {}
              if (ts.isObjectLiteralExpression(defaultsObj)) {
                for (const prop of defaultsObj.properties) {
                  if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                    defaults[prop.name.text] = prop.initializer.getText()
                  }
                }
              }

              if (callArg.typeArguments && callArg.typeArguments.length > 0) {
                const typeArg = callArg.typeArguments[0]!
                const refName = getTypeRefName(typeArg)
                if (refName) {
                  const iface = interfaces.get(refName)
                  if (iface) {
                    const baseProps = extractPropsFromInterface(iface)
                    for (const p of baseProps) {
                      const d = defaults[p.name]
                      if (d !== undefined) p.default = d
                    }
                    props.push(...baseProps)
                  }
                } else if (ts.isTypeLiteralNode(typeArg)) {
                  props.push(...extractPropsFromTypeLiteral(typeArg, defaults))
                }
              } else if (callArg.arguments.length > 0) {
                const arg = callArg.arguments[0]!
                if (ts.isTypeLiteralNode(arg)) {
                  props.push(...extractPropsFromTypeLiteral(arg, defaults))
                }
              }
            }
          }
        }

        if (fnName === "defineSlots") {
          const typeArg = node.typeArguments?.[0]
          if (typeArg && ts.isTypeLiteralNode(typeArg)) {
            for (const member of typeArg.members) {
              if (ts.isMethodSignature(member) && member.name && ts.isIdentifier(member.name)) {
                const slotName = member.name.text
                const bindings: Record<string, string> = {}
                if (member.parameters.length > 0) {
                  const param = member.parameters[0]
                  if (param?.type) {
                    const typeText = param.type.getText()
                    bindings["props"] = typeText
                  }
                }
                slots.push({ name: slotName, bindings, description: "" })
              }
            }
          }
        }

        if (fnName === "defineEmits") {
          const typeArg = node.typeArguments?.[0]
          const runtimeArg = node.arguments?.[0]

          if (typeArg && ts.isTypeLiteralNode(typeArg)) {
            for (const member of typeArg.members) {
              if (
                ts.isPropertySignature(member) &&
                member.name &&
                ts.isIdentifier(member.name) &&
                member.type
              ) {
                const emitName = member.name.text
                let payloadType = "void"
                if (ts.isFunctionTypeNode(member.type) && member.type.parameters.length > 0) {
                  const param = member.type.parameters[0]
                  if (param?.type) {
                    payloadType = param.type.getText()
                  }
                }
                emits.push({ name: emitName, type: payloadType, description: "" })
              }
            }
          } else if (runtimeArg && ts.isTypeLiteralNode(runtimeArg)) {
            for (const member of runtimeArg.members) {
              if (
                ts.isPropertySignature(member) &&
                member.name &&
                ts.isIdentifier(member.name) &&
                member.type
              ) {
                const emitName = member.name.text
                let payloadType = "void"
                if (ts.isFunctionTypeNode(member.type) && member.type.parameters.length > 0) {
                  const param = member.type.parameters[0]
                  if (param?.type) {
                    payloadType = param.type.getText()
                  }
                }
                emits.push({ name: emitName, type: payloadType, description: "" })
              }
            }
          }
        }
      }
      ts.forEachChild(node, visit)
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
  if (!slots.length) {
    slots.push({ name: "default", bindings: {}, description: "" })
  }

  return { props, slots, emits }
}
