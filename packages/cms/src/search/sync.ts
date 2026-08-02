import type { BaseBlock } from "../core/types/blocks"

export function extractPlainTextFromBlocks(blocks: BaseBlock[], locale = "en"): string {
  const parts: string[] = []

  function walk(nodes: BaseBlock[]) {
    for (const node of nodes) {
      if (node.props) {
        if (typeof node.props.text === "object" && node.props.text !== null) {
          const locText = node.props.text[locale] || node.props.text.en
          if (locText) parts.push(String(locText))
        } else if (typeof node.props.text === "string") {
          parts.push(node.props.text)
        }

        if (typeof node.props.title === "object" && node.props.title !== null) {
          const locTitle = node.props.title[locale] || node.props.title.en
          if (locTitle) parts.push(String(locTitle))
        } else if (typeof node.props.title === "string") {
          parts.push(node.props.title)
        }
      }

      if (node.children?.length) {
        walk(node.children)
      }
    }
  }

  walk(blocks)
  return parts.join(" ")
}
