import type { BaseBlock } from "../core/types/blocks";
import { richTextToPlain } from "../core/richtext";

export interface TableOfContentsHeading {
  depth: number;
  slug: string;
  text: string;
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
    .replace(/-+$/, "");
}

/**
 * Headings from section blocks. The level comes from nesting (top-level section = h2), the
 * same rule the renderer uses, so the TOC always matches the page. Sections inside other
 * containers (callouts, tabs…) are found too; only sections add a level.
 */
export function extractHeadingsFromBlocks(
  blocks: BaseBlock[] = [],
  currentDepth = 2,
  locale = "en",
): TableOfContentsHeading[] {
  if (!Array.isArray(blocks)) return [];
  const headings: TableOfContentsHeading[] = [];
  for (const block of blocks) {
    if (!block) continue;
    const isSection = block.type === "SectionBlock";
    if (isSection) {
      const text = richTextToPlain(block.props?.["title"], locale);
      if (text) headings.push({ depth: currentDepth, slug: slugifyHeading(text), text });
    }
    if (block.children?.length) {
      headings.push(
        ...extractHeadingsFromBlocks(
          block.children,
          isSection ? Math.min(6, currentDepth + 1) : currentDepth,
          locale,
        ),
      );
    }
  }
  return headings;
}
