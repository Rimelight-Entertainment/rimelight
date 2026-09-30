import { renderToString as renderSolidToString } from "@solidjs/web";
import { createComponent } from "solid-js";

/**
 * Strips framework-specific SSR hydration markers and normalizes HTML for testing assertions.
 */
export function cleanHtml(html: string): string {
  return (
    html
      // Solid hydration markers
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/\sdata-hk="[^"]*"/g, "")
      // Unescape HTML entities in classes/attributes
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Collapse whitespace between tags
      .replace(/>\s+</g, "><")
      // Normalize whitespace inside attributes
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Extracts attributes and class list from an HTML fragment string.
 */
export function parseHtmlElement(html: string) {
  const cleaned = cleanHtml(html);
  const match = cleaned.match(/^<([a-zA-Z0-9-]+)([^>]*)>(.*)<\/\1>$/s);

  if (!match) {
    // Self closing or void element
    const selfClosingMatch = cleaned.match(/^<([a-zA-Z0-9-]+)([^>]*)\/?>$/s);
    if (selfClosingMatch) {
      const tag = selfClosingMatch[1] ?? "";
      const rawAttrs = selfClosingMatch[2] ?? "";
      return {
        tag,
        attributes: parseAttributes(rawAttrs),
        classes: extractClasses(rawAttrs),
        innerHtml: ""
      };
    }
    return { tag: "", attributes: {}, classes: [] as string[], innerHtml: cleaned };
  }

  const tag = match[1] ?? "";
  const rawAttrs = match[2] ?? "";
  const innerHtml = match[3] ?? "";

  return {
    tag,
    attributes: parseAttributes(rawAttrs),
    classes: extractClasses(rawAttrs),
    innerHtml
  };
}

function parseAttributes(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const regex = /([a-zA-Z0-9-_:]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(raw)) !== null) {
    const key = match[1];
    if (!key || key === "class" || key === "className") continue;
    const val = match[2] ?? match[3] ?? match[4] ?? "";
    attrs[key] = val;
  }
  return attrs;
}

function extractClasses(raw: string): string[] {
  const match = raw.match(/class="([^"]*)"/);
  if (!match || !match[1]) return [];
  return match[1].split(/\s+/).filter(Boolean).sort();
}

/**
 * Helper to render a Solid component to normalized HTML.
 */
export function renderSolid(
  component: any,
  props: Record<string, any> = {},
  children?: any
): string {
  return cleanHtml(
    renderSolidToString(() =>
      createComponent(component, {
        ...props,
        children: children ?? props["children"]
      })
    )
  );
}
