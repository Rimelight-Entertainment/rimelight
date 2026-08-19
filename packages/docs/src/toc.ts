export interface TableOfContentsHeading {
  depth: number
  slug: string
  text: string
}

export function slugifyHeading(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
}

export function extractHeadingsFromBlocks(
  blocks: any[] = [],
  currentDepth = 2
): TableOfContentsHeading[] {
  if (!Array.isArray(blocks)) return []
  const headings: TableOfContentsHeading[] = []

  for (const block of blocks) {
    if (!block) continue
    if (block.type === "SectionBlock") {
      const title = block.props?.title || ""
      const level = Number(block.props?.level) || currentDepth
      if (title) {
        headings.push({
          depth: level,
          slug: slugifyHeading(title),
          text: title
        })
      }
      const children = block.children || block.props?.children || []
      if (Array.isArray(children) && children.length > 0) {
        headings.push(...extractHeadingsFromBlocks(children, Math.min(6, level + 1)))
      }
    }
  }

  return headings
}
