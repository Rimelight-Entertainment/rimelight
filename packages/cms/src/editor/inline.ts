import type { InlineNode, TextInlineNode } from "../core/types/inline";

/**
 * Conversions between the stored inline AST (`InlineNode[]`) and contenteditable HTML.
 * Pure functions (the DOM parser takes an element), shared by the editor and tests.
 */

type Mark = NonNullable<TextInlineNode["marks"]>[number];
const MARK_TAGS: [Mark, string][] = [
  ["code", "code"],
  ["strikethrough", "s"],
  ["underline", "u"],
  ["italic", "em"],
  ["bold", "strong"],
];
const TAG_MARKS: Record<string, Mark> = {
  STRONG: "bold",
  B: "bold",
  EM: "italic",
  I: "italic",
  U: "underline",
  S: "strikethrough",
  STRIKE: "strikethrough",
  DEL: "strikethrough",
  CODE: "code",
};

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Rich text props are `InlineNode[]`; a plain string (e.g. a block that changed type) becomes one text node. */
export function toInlineNodes(value: unknown): InlineNode[] {
  if (Array.isArray(value)) return value as InlineNode[];
  if (typeof value === "string") return value ? [{ type: "text", text: value }] : [];
  return [];
}

/** The text of a plain-text prop (string, or rich nodes flattened). */
export function toPlainText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return inlineToPlainText(toInlineNodes(value));
}

export function inlineToPlainText(nodes: InlineNode[]): string {
  return nodes
    .map((n) =>
      n.type === "text" ? n.text : n.type === "link" ? inlineToPlainText(n.children) : (n.displayTitle ?? n.pageSlug),
    )
    .join("");
}

export function inlineToHtml(nodes: InlineNode[]): string {
  return nodes
    .map((n) => {
      if (n.type === "text") {
        let html = escape(n.text).replace(/\n/g, "<br>");
        for (const [mark, tag] of MARK_TAGS) if (n.marks?.includes(mark)) html = `<${tag}>${html}</${tag}>`;
        return html;
      }
      if (n.type === "link") {
        const target = n.openInNewTab ? ' target="_blank"' : "";
        return `<a href="${escape(n.url)}"${target}>${inlineToHtml(n.children)}</a>`;
      }
      return `<span data-mention="${escape(n.pageId)}" data-slug="${escape(n.pageSlug)}" contenteditable="false">@${escape(n.displayTitle ?? n.pageSlug)}</span>`;
    })
    .join("");
}

/** Parses a contenteditable element back into inline nodes, merging adjacent equal-mark runs. */
export function htmlToInline(root: Node): InlineNode[] {
  const out: InlineNode[] = [];
  const pushText = (text: string, marks: Mark[]) => {
    if (!text) return;
    const last = out[out.length - 1];
    const sorted = [...new Set(marks)].sort();
    if (last?.type === "text" && JSON.stringify(last.marks ?? []) === JSON.stringify(sorted)) {
      last.text += text;
      return;
    }
    out.push(sorted.length ? { type: "text", text, marks: sorted } : { type: "text", text });
  };

  const walk = (node: Node, marks: Mark[]) => {
    if (node.nodeType === 3) return pushText(node.textContent ?? "", marks);
    if (node.nodeType !== 1) return;
    const el = node as HTMLElement;
    if (el.tagName === "BR") return pushText("\n", marks);
    if (el.dataset?.["mention"]) {
      out.push({
        type: "page_mention",
        pageId: el.dataset["mention"],
        pageSlug: el.dataset["slug"] ?? "",
        displayTitle: (el.textContent ?? "").replace(/^@/, ""),
      });
      return;
    }
    if (el.tagName === "A") {
      const children = htmlToInline(el).filter((c): c is TextInlineNode => c.type === "text");
      out.push({
        type: "link",
        url: el.getAttribute("href") ?? "",
        children,
        ...(el.getAttribute("target") === "_blank" ? { openInNewTab: true } : {}),
      });
      return;
    }
    const mark = TAG_MARKS[el.tagName];
    const next = mark ? [...marks, mark] : marks;
    // Browsers wrap new lines in <div>/<p> inside contenteditable.
    if ((el.tagName === "DIV" || el.tagName === "P") && out.length) pushText("\n", marks);
    el.childNodes.forEach((c) => walk(c, next));
  };

  root.childNodes.forEach((c) => walk(c, []));
  // Trailing newline from a final <br> is a browser artifact.
  const last = out[out.length - 1];
  if (last?.type === "text" && last.text.endsWith("\n")) {
    last.text = last.text.slice(0, -1);
    if (!last.text) out.pop();
  }
  return out;
}
