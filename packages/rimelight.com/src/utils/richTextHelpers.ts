import type { RichTextContent, InlineText } from "@/types/blocks";

/**
 * Helper: Converts RichTextContent array into a plain string for a simple contenteditable area.
 */
export function richTextToHtml(content: RichTextContent): string {
  return content
    .map((item) => {
      if (item.type === "text" || item.type === "link") {
        return item.props.content;
      }
      if (item.type === "mention") {
        return "";
      }
      return "";
    })
    .join("");
}

/**
 * Helper: Converts a plain string from a contenteditable area back into RichTextContent.
 * Uses native crypto.randomUUID() for high performance and zero external package dependency.
 */
export function parseHtmlToRichText(html: string): RichTextContent {
  if (html.trim().length === 0) {
    return [];
  }

  const newTextNode: InlineText = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
    type: "text",
    props: {
      content: html.trim(),
    },
  };

  return [newTextNode];
}
