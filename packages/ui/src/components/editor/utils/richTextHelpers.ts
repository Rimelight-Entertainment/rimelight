import type { RichTextContent, InlineText } from "../types/blocks"

export function richTextToHtml(content: RichTextContent): string {
  if (!Array.isArray(content)) return ""
  return content
    .map((item) => {
      if (item.type === "text" || item.type === "link") {
        return item.props.content
      }
      if (item.type === "mention") {
        return ""
      }
      return ""
    })
    .join("")
}

export function parseHtmlToRichText(html: string): RichTextContent {
  if (!html || html.trim().length === 0) {
    return []
  }

  const newTextNode: InlineText = {
    id:
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 15),
    type: "text",
    props: {
      content: html.trim()
    }
  }

  return [newTextNode]
}
