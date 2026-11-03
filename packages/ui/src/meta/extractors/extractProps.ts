import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { PropMeta, SlotMeta } from "../types.ts";

/**
 * Props and slots of an RL component, read from `components/<kebab>/<kebab>.types.ts`:
 * the members of `export interface RL<Name>Props { … }` or of the object literal in `export type RL<Name>Props = … & { … }`, with their JSDoc comments.
 *
 * - `foo?: T` → optional prop; no `?` → required.
 * - A "(default: x)" phrase or `@default x` tag in the comment becomes the default.
 * - Members named `children` or ending in `Slot` are slots, not props.
 *
 * Text-based (no TS compiler) on purpose, like the theme extractor; it is temporary until
 * @rimelight/ui generates this metadata itself.
 */
export function extractPropsMeta(
  componentName: string,
  componentsDir: string,
): { props: PropMeta[]; slots: SlotMeta[] } {
  const kebab = componentName.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  const file = path.join(componentsDir, kebab, `${kebab}.types.ts`);
  if (!existsSync(file)) return { props: [], slots: [] };
  const source = readFileSync(file, "utf-8");

  const head = new RegExp(
    `export\\s+(?:interface\\s+RL${componentName}Props\\b[^{]*|type\\s+RL${componentName}Props\\s*=[^{;]*)\\{`,
  ).exec(source);
  if (!head) return { props: [], slots: [] };
  const body = sliceBalanced(source, head.index + head[0].length - 1);
  if (body == null) return { props: [], slots: [] };

  const props: PropMeta[] = [];
  const slots: SlotMeta[] = [];
  for (const member of topLevelMembers(body)) {
    const m = /^(?:readonly\s+)?(["']?[\w$-]+["']?)(\?)?\s*:\s*([\s\S]+)$/.exec(member.code);
    if (!m) continue; // index signatures, methods…
    const name = m[1]!.replace(/["']/g, "");
    const type = m[3]!
      .replace(/\s+/g, " ")
      .replace(/^\|\s*/, "")
      .trim();
    const { description, defaultValue } = parseDoc(member.doc);
    if (name === "children" || name.endsWith("Slot")) {
      slots.push({
        name: name === "children" ? "default" : name.replace(/Slot$/, ""),
        bindings: {},
        description,
      });
      continue;
    }
    props.push({
      name,
      type,
      required: !m[2],
      description,
      ...(defaultValue !== undefined ? { default: defaultValue } : {}),
    });
  }
  return { props, slots };
}

/** Content between the brace at `open` and its match (strings and comments aware). */
function sliceBalanced(src: string, open: number): string | null {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (c === '"' || c === "'" || c === "`") {
      const q = c;
      for (i++; i < src.length && src[i] !== q; i++) if (src[i] === "\\") i++;
      continue;
    }
    if (c === "/" && src[i + 1] === "/") {
      i = src.indexOf("\n", i);
      if (i === -1) return null;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      i = src.indexOf("*/", i + 2) + 1;
      if (i === 0) return null;
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return src.slice(open + 1, i);
  }
  return null;
}

/** Splits an interface body into members (`;`/newline-terminated at depth 0) with their JSDoc. */
function topLevelMembers(body: string): { code: string; doc: string }[] {
  const out: { code: string; doc: string }[] = [];
  let depth = 0;
  let doc = "";
  let code = "";
  const flush = () => {
    const c = code.trim().replace(/[;,]$/, "").trim();
    if (c) out.push({ code: c, doc });
    code = "";
    doc = "";
  };
  for (let i = 0; i < body.length; i++) {
    const ch = body[i]!;
    if (depth === 0 && ch === "/" && body[i + 1] === "*") {
      const end = body.indexOf("*/", i + 2);
      if (end === -1) break;
      if (!code.trim()) doc = body.slice(i, end + 2);
      i = end + 1;
      continue;
    }
    if (depth === 0 && ch === "/" && body[i + 1] === "/") {
      const end = body.indexOf("\n", i);
      i = end === -1 ? body.length : end;
      if (code.trim()) code += " ";
      continue;
    }
    if (ch === "{" || ch === "(" || ch === "<" || ch === "[") depth++;
    else if ((ch === "}" || ch === ")" || ch === ">" || ch === "]") && depth > 0) {
      // `=>` is not a closing angle bracket
      if (!(ch === ">" && body[i - 1] === "=")) depth--;
    }
    if (depth === 0 && (ch === ";" || ch === "\n")) {
      // A newline only ends a member when the member looks complete and the next line doesn't
      // continue it (multi-line unions start lines with `|`).
      const nextLine = body.slice(i + 1).trimStart();
      const continues = /^[|&]/.test(nextLine);
      if (
        ch === ";" ||
        (!continues && /:\s*\S/.test(code) && !/[|&,(<{[:]\s*$/.test(code.trim()))
      ) {
        flush();
        continue;
      }
    }
    code += ch;
  }
  flush();
  return out;
}

function parseDoc(doc: string): { description: string; defaultValue?: string } {
  if (!doc) return { description: "" };
  const lines = doc
    .replace(/^\/\*\*?|\*\/$/g, "")
    .split("\n")
    .map((l) => l.replace(/^\s*\*\s?/, "").trim());
  let defaultValue: string | undefined;
  const text: string[] = [];
  for (const l of lines) {
    const tag = /^@default\s+(.+)$/.exec(l);
    if (tag) defaultValue = tag[1]!.trim();
    else if (!l.startsWith("@")) text.push(l);
  }
  let description = text.join(" ").replace(/\s+/g, " ").trim();
  const inline = /\(default:\s*([^)]+)\)/i.exec(description);
  if (inline) {
    defaultValue ??= inline[1]!.trim();
    description = description.replace(inline[0], "").replace(/\s+/g, " ").trim();
  }
  return { description, ...(defaultValue !== undefined ? { defaultValue } : {}) };
}
