import type { InlineMark, InlineNode, TextInlineNode } from "../core/types/inline";
import { compactRichText, inlineToPlainText, toRichText } from "../core/richtext";

/**
 * Conversions between the stored inline AST (`InlineNode[]`) and contenteditable HTML.
 * Pure functions (the DOM parser takes an element), shared by the editor and tests.
 *
 * Atomic nodes (mentions, emoji, icons) render as `contenteditable="false"` spans carrying
 * their data in `data-*` attributes, so the caret treats them as single characters and the
 * parser can read them back losslessly.
 */

const MARK_TAGS: [InlineMark, string][] = [
  ["code", "code"],
  ["strikethrough", "s"],
  ["underline", "u"],
  ["italic", "em"],
  ["bold", "strong"],
];
const TAG_MARKS: Record<string, InlineMark> = {
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

/** Rich text props are `InlineNode[]`; a plain string becomes one text node. */
export const toInlineNodes = toRichText;

/** The text of a plain-text prop (string, or rich nodes flattened). */
export function toPlainText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return inlineToPlainText(toRichText(value));
}

export interface InlineHtmlOptions {
  /** Text colour for a mention, by collection slug. */
  mentionColor?: (collection: string) => string;
  /** The entry's current title in the editor locale; the stored title is the fallback. */
  mentionTitle?: (entryId: string) => string | undefined;
}

function textHtml(n: TextInlineNode) {
  let html = escape(n.text ?? "").replace(/\n/g, "<br>");
  for (const [mark, tag] of MARK_TAGS)
    if (n.marks?.includes(mark)) html = `<${tag}>${html}</${tag}>`;
  return html;
}

/** One mention, as it appears in the editor: the title in its collection's colour. */
export function mentionHtml(
  n: { entryId: string; collection: string; slug: string; title?: string | undefined },
  opts: InlineHtmlOptions = {},
): string {
  const color = escape(opts.mentionColor?.(n.collection) ?? "currentColor");
  const title = opts.mentionTitle?.(n.entryId) || n.title || "";
  return (
    `<span class="cms-mention" contenteditable="false" style="color:${color};font-weight:500;cursor:default"` +
    ` data-mention="${escape(n.entryId)}" data-collection="${escape(n.collection)}"` +
    ` data-slug="${escape(n.slug)}" data-title="${escape(title)}">` +
    `${escape(title || n.slug)}</span>`
  );
}

export function inlineToHtml(nodes: InlineNode[], opts: InlineHtmlOptions = {}): string {
  return nodes
    .map((n) => {
      switch (n.type) {
        case "text":
          return textHtml(n);
        case "link": {
          const target = n.openInNewTab ? ' data-new-tab="true"' : "";
          return `<a href="${escape(n.url ?? "")}"${target}>${(n.children ?? []).map(textHtml).join("")}</a>`;
        }
        case "mention":
          return mentionHtml(n, opts);
        case "emoji":
          return `<span class="cms-emoji" contenteditable="false" data-emoji="${escape(n.emoji)}" data-shortcode="${escape(n.shortcode ?? "")}">${escape(n.emoji)}</span>`;
        case "icon":
          return `<span class="cms-inline-icon ${escape(n.name)}" contenteditable="false" data-icon="${escape(n.name)}" data-label="${escape(n.label ?? "")}"></span>`;
        default:
          return "";
      }
    })
    .join("");
}

/** Parses a contenteditable element back into inline nodes, merging adjacent equal-mark runs. */
export function htmlToInline(root: Node): InlineNode[] {
  const out: InlineNode[] = [];
  const pushText = (text: string, marks: InlineMark[]) => {
    if (!text) return;
    const sorted = [...new Set(marks)].sort();
    out.push(sorted.length ? { type: "text", text, marks: sorted } : { type: "text", text });
  };

  const walk = (node: Node, marks: InlineMark[]) => {
    if (node.nodeType === 3) return pushText(node.textContent ?? "", marks);
    if (node.nodeType !== 1) return;
    const el = node as HTMLElement;
    const d = el.dataset ?? {};
    if (el.tagName === "BR") return pushText("\n", marks);
    if (d["mention"]) {
      out.push({
        type: "mention",
        entryId: d["mention"],
        collection: d["collection"] ?? "page",
        slug: d["slug"] ?? "",
        ...(d["title"] ? { title: d["title"] } : {}),
      });
      return;
    }
    if (d["emoji"]) {
      out.push({
        type: "emoji",
        emoji: d["emoji"],
        ...(d["shortcode"] ? { shortcode: d["shortcode"] } : {}),
      });
      return;
    }
    if (d["icon"]) {
      out.push({ type: "icon", name: d["icon"], ...(d["label"] ? { label: d["label"] } : {}) });
      return;
    }
    if (el.tagName === "A") {
      const children = compactRichText(
        htmlToInlineWith(el, marks).filter((c): c is TextInlineNode => c.type === "text"),
      ) as TextInlineNode[];
      const url = el.getAttribute("href") ?? "";
      if (!url) return children.forEach((c) => out.push(c));
      out.push({
        type: "link",
        url,
        children,
        ...(d["newTab"] === "true" || el.getAttribute("target") === "_blank"
          ? { openInNewTab: true }
          : {}),
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
  const result = compactRichText(out);
  // Trailing newline from a final <br> is a browser artifact.
  const last = result[result.length - 1];
  if (last?.type === "text" && last.text.endsWith("\n")) {
    const text = last.text.slice(0, -1);
    if (text) result[result.length - 1] = { ...last, text };
    else result.pop();
  }
  return result;
}

/** Parses the children of `el` with inherited marks (used for link contents). */
function htmlToInlineWith(el: HTMLElement, marks: InlineMark[]): InlineNode[] {
  const nodes = htmlToInline(el);
  if (!marks.length) return nodes;
  return nodes.map((n) =>
    n.type === "text"
      ? { ...n, marks: [...new Set([...(n.marks ?? []), ...marks])].sort() as InlineMark[] }
      : n,
  );
}
