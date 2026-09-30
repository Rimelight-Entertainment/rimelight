import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { ThemeMeta } from "../types.ts";

function getThemePath(componentName: string, componentsDir: string): string {
  const kebabName = componentName.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  return path.join(componentsDir, kebabName, `${kebabName}.theme.ts`);
}

function extractThemeFromFile(filePath: string): any {
  const content = readFileSync(filePath, "utf-8");

  const defineThemeIndex = content.indexOf("defineTheme(");
  if (defineThemeIndex === -1) {
    throw new Error("No defineTheme call found");
  }

  const firstBraceIndex = content.indexOf("{", defineThemeIndex);
  if (firstBraceIndex === -1) {
    throw new Error("No opening brace found");
  }

  let depth = 0;
  let end = -1;
  let inString = false;
  let stringChar: string | null = null;

  for (let i = firstBraceIndex; i < content.length; i++) {
    const char = content[i];

    if (inString) {
      if (char === "\\") {
        i++;
      } else if (char === stringChar) {
        inString = false;
        stringChar = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      inString = true;
      stringChar = char;
      continue;
    }

    if (char === "{") {
      depth++;
    } else if (char === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  if (end === -1) {
    throw new Error("No matching closing brace found");
  }

  const objectLiteral = content.slice(firstBraceIndex, end + 1);

  return JSON.parse(objectLiteralToJson(objectLiteral));
}

/**
 * Converts a JS object literal (single-quoted strings, unquoted keys, numeric keys, trailing
 * commas, `//` and `/*` comments) into valid JSON.
 */
function objectLiteralToJson(literal: string): string {
  let out = "";
  let i = 0;
  const n = literal.length;
  const escapes: Record<string, string> = {
    n: "\n",
    t: "\t",
    r: "\r",
    b: "\b",
    f: "\f",
    v: "\v",
    "0": "\0"
  };

  while (i < n) {
    const ch = literal[i]!;

    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      out += ch;
      i++;
      continue;
    }

    if (ch === "/" && literal[i + 1] === "/") {
      while (i < n && literal[i] !== "\n") i++;
      continue;
    }
    if (ch === "/" && literal[i + 1] === "*") {
      i += 2;
      while (i < n && !(literal[i] === "*" && literal[i + 1] === "/")) i++;
      i = Math.min(n, i + 2);
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      const quote = ch;
      let body = "";
      i++;
      while (i < n) {
        const c = literal[i];
        if (c === "\\") {
          const next = literal[i + 1];
          if (next === quote) {
            body += quote;
          } else if (next === undefined) {
            body += "\\";
          } else {
            body += next === "\\" ? "\\" : (escapes[next] ?? next);
          }
          i += 2;
          continue;
        }
        if (c === quote) break;
        body += c;
        i++;
      }
      out += JSON.stringify(body);
      i++;
      continue;
    }

    if (ch === ",") {
      let j = i + 1;
      while (
        j < n &&
        (literal[j] === " " || literal[j] === "\t" || literal[j] === "\n" || literal[j] === "\r")
      ) {
        j++;
      }
      if (literal[j] === "}" || literal[j] === "]") {
        i++;
        continue;
      }
      out += ch;
      i++;
      continue;
    }

    const keyMatch = /^([A-Za-z_$][\w$]*|\d+)(\s*):/.exec(literal.slice(i));
    if (keyMatch) {
      out += `"${keyMatch[1]}"${keyMatch[2]}:`;
      i += keyMatch[0].length;
      continue;
    }

    out += ch;
    i++;
  }
  return out;
}

export async function extractAllThemesMeta(
  componentNames: string[],
  componentsDir: string
): Promise<Record<string, ThemeMeta>> {
  const results: Record<string, ThemeMeta> = {};

  for (const name of componentNames) {
    const themePath = getThemePath(name, componentsDir);
    if (!existsSync(themePath)) continue;

    try {
      const themeObj = extractThemeFromFile(themePath);

      const slotsRaw = Reflect.get(themeObj, "slots");
      const slots: string[] = [];
      if (Array.isArray(slotsRaw)) {
        for (const s of slotsRaw) {
          if (typeof s === "string") slots.push(s);
        }
      }

      const baseRaw = Reflect.get(themeObj, "base");
      const base: Record<string, string | string[]> = {};
      if (baseRaw && typeof baseRaw === "object") {
        for (const key of Object.getOwnPropertyNames(baseRaw)) {
          const val = Reflect.get(baseRaw, key);
          if (typeof val === "string") {
            base[key] = val;
          } else if (Array.isArray(val)) {
            const items: string[] = [];
            for (const item of val) {
              if (typeof item === "string") items.push(item);
            }
            if (items.length > 0) base[key] = items;
          }
        }
      }

      const variantsRaw = Reflect.get(themeObj, "variants");
      const variants: Record<string, Record<string, Record<string, string | string[]>>> = {};
      if (variantsRaw && typeof variantsRaw === "object") {
        for (const outerKey of Object.getOwnPropertyNames(variantsRaw)) {
          const inner = Reflect.get(variantsRaw, outerKey);
          if (inner && typeof inner === "object") {
            const innerRecord: Record<string, Record<string, string | string[]>> = {};
            for (const midKey of Object.getOwnPropertyNames(inner)) {
              const innerMost = Reflect.get(inner, midKey);
              if (innerMost && typeof innerMost === "object") {
                const leafRecord: Record<string, string | string[]> = {};
                for (const leafKey of Object.getOwnPropertyNames(innerMost)) {
                  const leafVal = Reflect.get(innerMost, leafKey);
                  if (typeof leafVal === "string") {
                    leafRecord[leafKey] = leafVal;
                  } else if (Array.isArray(leafVal)) {
                    const items: string[] = [];
                    for (const item of leafVal) {
                      if (typeof item === "string") items.push(item);
                    }
                    if (items.length > 0) leafRecord[leafKey] = items;
                  }
                }
                if (Object.getOwnPropertyNames(leafRecord).length > 0) {
                  innerRecord[midKey] = leafRecord;
                }
              }
            }
            if (Object.getOwnPropertyNames(innerRecord).length > 0) {
              variants[outerKey] = innerRecord;
            }
          }
        }
      }

      const cvRaw = Reflect.get(themeObj, "compoundVariants");
      const compoundVariants: Record<string, unknown>[] = [];
      if (Array.isArray(cvRaw)) {
        for (const cv of cvRaw) {
          if (cv && typeof cv === "object") {
            const entry: Record<string, unknown> = {};
            for (const key of Object.getOwnPropertyNames(cv)) {
              entry[key] = Reflect.get(cv, key);
            }
            compoundVariants.push(entry);
          }
        }
      }

      const dvRaw = Reflect.get(themeObj, "defaultVariants");
      const defaultVariants: Record<string, unknown> = {};
      if (dvRaw && typeof dvRaw === "object") {
        for (const key of Object.getOwnPropertyNames(dvRaw)) {
          defaultVariants[key] = Reflect.get(dvRaw, key);
        }
      }

      results[name] = { slots, base, variants, compoundVariants, defaultVariants };
    } catch (err) {
      console.warn(`[docs] Failed to extract theme for ${name}:`, err);
    }
  }

  return results;
}
