import type { BaseBlock } from "./types/blocks";
import { richTextToPlain } from "./richtext";

/** Plain text of a prop: rich text nodes, localized maps, or plain strings. */
function extractTextFromProperty(prop: unknown, locale: string = "en"): string {
  return richTextToPlain(prop, locale);
}

/**
 * Recursively extracts plain text from an array of CMS blocks.
 */
export function extractTextFromBlocks(
  blocks: BaseBlock[] | undefined | null,
  locale: string = "en",
): string {
  if (!blocks || !Array.isArray(blocks)) return "";

  const chunks: string[] = [];

  for (const block of blocks) {
    if (!block) continue;

    const props = block.props || {};

    switch (block.type) {
      case "ParagraphBlock": {
        const text = extractTextFromProperty(props["text"], locale);
        if (text) chunks.push(text);
        break;
      }
      case "SectionBlock": {
        if (props["title"]) chunks.push(extractTextFromProperty(props["title"], locale));
        if (props["description"])
          chunks.push(extractTextFromProperty(props["description"], locale));
        if (Array.isArray(props["children"])) {
          const childText = extractTextFromBlocks(props["children"], locale);
          if (childText) chunks.push(childText);
        }
        break;
      }
      case "CardBlock": {
        if (props["title"]) chunks.push(extractTextFromProperty(props["title"], locale));
        if (props["description"])
          chunks.push(extractTextFromProperty(props["description"], locale));
        break;
      }
      case "DialogueBlock": {
        const line = extractTextFromProperty(props["line"], locale);
        if (props["character"] && line) chunks.push(`${props["character"]}: ${line}`);
        else if (line) chunks.push(line);
        break;
      }
      case "StepItemBlock": {
        if (props["title"]) chunks.push(extractTextFromProperty(props["title"], locale));
        if (props["description"])
          chunks.push(extractTextFromProperty(props["description"], locale));
        break;
      }
      default:
        break;
    }

    if (Array.isArray(block.children) && block.children.length > 0) {
      const childText = extractTextFromBlocks(block.children, locale);
      if (childText) chunks.push(childText);
    }
  }

  return chunks.join(" ").replace(/\s+/g, " ").trim();
}

export interface ExcerptOptions {
  maxLength?: number;
  locale?: string;
  fallback?: string;
}

/**
 * Generates an SEO / RSS safe plain text excerpt from a CMS page or block payload.
 */
export function createPageExcerpt(
  page:
    | {
        description?: unknown;
        content?: unknown;
        title?: unknown;
      }
    | null
    | undefined,
  options: ExcerptOptions = {},
): string {
  const { maxLength = 160, locale = "en", fallback = "" } = options;

  if (!page) return fallback;

  // 1. First priority: explicit localized description
  const explicitDesc = extractTextFromProperty(page.description, locale);
  if (explicitDesc) {
    return truncateExcerpt(explicitDesc, maxLength);
  }

  // 2. Second priority: content properties description
  let contentObj = page.content;
  if (typeof contentObj === "string") {
    try {
      contentObj = JSON.parse(contentObj);
    } catch {
      contentObj = null;
    }
  }

  if (contentObj && typeof contentObj === "object") {
    const props = (contentObj as { properties?: Record<string, unknown> }).properties;
    if (props && props["description"]) {
      const descText = extractTextFromProperty(props["description"], locale);
      if (descText) return truncateExcerpt(descText, maxLength);
    }

    // 3. Third priority: extract from blocks
    const blocks = (contentObj as { blocks?: BaseBlock[] }).blocks;
    if (Array.isArray(blocks) && blocks.length > 0) {
      const extracted = extractTextFromBlocks(blocks, locale);
      if (extracted) return truncateExcerpt(extracted, maxLength);
    }
  }

  return fallback;
}

function truncateExcerpt(text: string, maxLength: number): string {
  const clean = text
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trimEnd()}…`;
}
