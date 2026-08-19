import type { BaseBlock, HeadingLevel } from "../core/types/blocks"
import type { InlineNode } from "../core/types/inline"

function genId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11)
}

export function parseInlines(text: string): InlineNode[] {
  if (!text) return []

  const inlines: InlineNode[] = []
  // Regex to match markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = linkRegex.exec(text)) !== null) {
    const beforeText = text.substring(lastIndex, match.index)
    if (beforeText) {
      inlines.push(...parseFormattedText(beforeText))
    }

    const linkText = match[1] || ""
    const linkUrl = match[2] || ""

    inlines.push({
      type: "link",
      url: linkUrl,
      children: [{ type: "text", text: linkText }]
    })

    lastIndex = linkRegex.lastIndex
  }

  const remainingText = text.substring(lastIndex)
  if (remainingText) {
    inlines.push(...parseFormattedText(remainingText))
  }

  return inlines.length > 0 ? inlines : [{ type: "text", text }]
}

function parseFormattedText(str: string): InlineNode[] {
  if (!str) return []

  // Tokenize bold, italic, code marks
  // Format: `code`, **bold**, *italic*, ~~strikethrough~~
  const result: InlineNode[] = []
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~)/g
  let lastIdx = 0
  let match: RegExpExecArray | null

  while ((match = tokenRegex.exec(str)) !== null) {
    const rawBefore = str.substring(lastIdx, match.index)
    if (rawBefore) {
      result.push({ type: "text", text: rawBefore })
    }

    const token = match[1] || ""
    if (token.startsWith("`") && token.endsWith("`")) {
      result.push({
        type: "text",
        text: token.slice(1, -1),
        marks: ["code"]
      })
    } else if (token.startsWith("**") && token.endsWith("**")) {
      result.push({
        type: "text",
        text: token.slice(2, -2),
        marks: ["bold"]
      })
    } else if (token.startsWith("*") && token.endsWith("*")) {
      result.push({
        type: "text",
        text: token.slice(1, -1),
        marks: ["italic"]
      })
    } else if (token.startsWith("~~") && token.endsWith("~~")) {
      result.push({
        type: "text",
        text: token.slice(2, -2),
        marks: ["strikethrough"]
      })
    }

    lastIdx = tokenRegex.lastIndex
  }

  const remaining = str.substring(lastIdx)
  if (remaining) {
    result.push({ type: "text", text: remaining })
  }

  return result
}

export function parseMarkdownTable(tableText: string): BaseBlock | null {
  const lines = tableText
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length < 2) return null

  const parseRow = (line: string) =>
    line
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.trim())

  const headerCells = parseRow(lines[0] || "")
  const alignCells = parseRow(lines[1] || "")

  // Verify second line is alignment separator (e.g. ---, :---:, ---:)
  if (!alignCells.every((c) => /^[:-]+$/.test(c))) {
    return null
  }

  const columns = headerCells.map((header, idx) => {
    const alignStr = alignCells[idx] || ""
    let align: "left" | "center" | "right" = "left"
    if (alignStr.startsWith(":") && alignStr.endsWith(":")) {
      align = "center"
    } else if (alignStr.endsWith(":")) {
      align = "right"
    }
    return {
      key: `col_${idx}`,
      header,
      align
    }
  })

  const rows: Record<string, string>[] = []
  for (let i = 2; i < lines.length; i++) {
    const cells = parseRow(lines[i] || "")
    const rowObj: Record<string, string> = {}
    columns.forEach((col, idx) => {
      rowObj[col.key] = cells[idx] || ""
    })
    rows.push(rowObj)
  }

  return {
    id: genId(),
    type: "TableBlock",
    props: {
      columns,
      rows,
      caption: ""
    }
  }
}

export function markdownToBlocks(markdown: string): BaseBlock[] {
  if (!markdown) return []

  // Strip frontmatter if present
  let cleanMd = markdown.trim()
  if (cleanMd.startsWith("---")) {
    const endFm = cleanMd.indexOf("---", 3)
    if (endFm !== -1) {
      cleanMd = cleanMd.substring(endFm + 3).trim()
    }
  }

  const rootBlocks: BaseBlock[] = []
  const sectionStack: { level: number; block: BaseBlock }[] = []

  const appendToCurrentScope = (block: BaseBlock) => {
    if (sectionStack.length > 0) {
      const topSection = sectionStack[sectionStack.length - 1]!.block
      if (!topSection.children) topSection.children = []
      if (!topSection.props.children) topSection.props.children = []
      topSection.children.push(block)
      topSection.props.children.push(block)
    } else {
      rootBlocks.push(block)
    }
  }

  const lines = cleanMd.split("\n")
  let i = 0

  while (i < lines.length) {
    const line = lines[i] || ""
    const trimmed = line.trim()

    if (!trimmed) {
      i++
      continue
    }

    // 1. Code Block Fence (```)
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !(lines[i] || "").trim().startsWith("```")) {
        codeLines.push(lines[i] || "")
        i++
      }
      i++ // Skip closing ```
      appendToCurrentScope({
        id: genId(),
        type: "CodeBlock",
        props: {
          language: lang || "text",
          code: codeLines.join("\n"),
          caption: ""
        }
      })
      continue
    }

    // 2. Headings (# to ######)
    const headingMatch = line.match(/^(#{1,6})\s(.*)$/)
    if (headingMatch) {
      const hashes = headingMatch[1] || ""
      const title = (headingMatch[2] || "").trim()
      const level = Math.min(6, Math.max(2, hashes.length)) as HeadingLevel

      const newSection: BaseBlock = {
        id: genId(),
        type: "SectionBlock",
        children: [],
        props: {
          title,
          level,
          description: "",
          children: []
        }
      }

      // Pop sections with higher or equal level
      while (sectionStack.length > 0 && sectionStack[sectionStack.length - 1]!.level >= level) {
        sectionStack.pop()
      }

      appendToCurrentScope(newSection)
      sectionStack.push({ level, block: newSection })
      i++
      continue
    }

    // 3. Callouts / Blockquotes (> [!NOTE], > [!WARNING], > etc.)
    if (trimmed.startsWith(">")) {
      const calloutLines: string[] = []
      while (i < lines.length && (lines[i] || "").trim().startsWith(">")) {
        calloutLines.push((lines[i] || "").trim().replace(/^>\s?/, ""))
        i++
      }
      const firstLine = calloutLines[0] || ""
      const variantMatch = firstLine.match(/^\[!([A-Z]+)\]/i)
      let variant = "info"
      let contentLines = calloutLines

      if (variantMatch) {
        variant = (variantMatch[1] || "info").toLowerCase()
        contentLines = calloutLines.slice(1)
      }

      const childMd = contentLines.join("\n").trim()
      const calloutChildren = childMd ? markdownToBlocks(childMd) : []

      appendToCurrentScope({
        id: genId(),
        type: "CalloutBlock",
        children: calloutChildren,
        props: {
          variant,
          children: calloutChildren
        }
      })
      continue
    }

    // 4. Markdown Table (| Header | Header |)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines: string[] = []
      while (
        i < lines.length &&
        (lines[i] || "").trim().startsWith("|") &&
        (lines[i] || "").trim().endsWith("|")
      ) {
        tableLines.push(lines[i] || "")
        i++
      }
      const tableBlock = parseMarkdownTable(tableLines.join("\n"))
      if (tableBlock) {
        appendToCurrentScope(tableBlock)
        continue
      }
    }

    // 5. Image (![alt](src))
    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (imageMatch) {
      appendToCurrentScope({
        id: genId(),
        type: "ImageBlock",
        props: {
          alt: imageMatch[1] || "",
          src: imageMatch[2] || "",
          caption: ""
        }
      })
      i++
      continue
    }

    // 6. Regular Paragraph (gather lines until blank line or block start)
    const paragraphLines: string[] = []
    while (
      i < lines.length &&
      (lines[i] || "").trim() &&
      !(lines[i] || "").trim().startsWith("```") &&
      !(lines[i] || "").trim().startsWith("#") &&
      !(lines[i] || "").trim().startsWith(">") &&
      !((lines[i] || "").trim().startsWith("|") && (lines[i] || "").trim().endsWith("|")) &&
      !/^[0-9]+\.\s/.test((lines[i] || "").trim())
    ) {
      paragraphLines.push(lines[i] || "")
      i++
    }

    if (paragraphLines.length > 0) {
      const paragraphText = paragraphLines.join(" ").trim()
      const inlines = parseInlines(paragraphText)
      appendToCurrentScope({
        id: genId(),
        type: "ParagraphBlock",
        props: {
          text: inlines
        }
      })
    } else {
      // Advance if no block consumed
      i++
    }
  }

  return rootBlocks
}
