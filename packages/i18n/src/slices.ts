import { collectKeys } from "./typegen";

/** Every key `t()` accepts, plus every namespace above them (readable through `t.raw`). */
export interface KeyIndex {
  keys: Set<string>;
  namespaces: Set<string>;
}

/** The keys a source file refers to, directly or through a namespace. */
export interface UsedKeys {
  keys: string[];
  namespaces: string[];
}

/** Single/double-quoted strings (kept so `https://` isn't mistaken for a comment) or JS comments. */
const STRING_OR_COMMENT = /(["'])(?:\\[\s\S]|(?!\1)[^\\\n])*?\1|\/\/[^\n]*|\/\*[\s\S]*?\*\//g;

/** Replaces line and block comments with a space while preserving quoted string literals. */
export const stripComments = (source: string): string =>
  source.replace(STRING_OR_COMMENT, (match, quote) => (quote ? match : " "));

/** Quoted string literals made of key characters. A literal is a key only if it exactly names one. */
const LITERAL = /(["'`])([A-Za-z0-9_\-.]+)\1/g;
/**
 * Namespace reads: the first argument of `t(…)`, `t.raw(…)` or `t.array(…)` when it is a plain or
 * template string. Only these count as namespaces; common words such as "page" appear everywhere.
 */
const NAMESPACE_CALL =
  /\bt(?:\.raw|\.array)?(?:<[^>\n]*>)?\(\s*(?:"([A-Za-z0-9_\-.]+)"|'([A-Za-z0-9_\-.]+)'|`([A-Za-z0-9_\-.]+)\.\$\{)/g;

export const indexKeys = (base: Record<string, unknown>): KeyIndex => {
  const keys = new Set(collectKeys(base).map((entry) => entry.key));
  const namespaces = new Set<string>();
  for (const key of keys) {
    const parts = key.split(".");
    for (let i = 1; i < parts.length; i++) namespaces.add(parts.slice(0, i).join("."));
  }
  return { keys, namespaces };
};

export const usedKeys = (source: string, index: KeyIndex): UsedKeys => {
  const code = stripComments(source);
  const keys = new Set<string>();
  const namespaces = new Set<string>();
  for (const [, , literal] of code.matchAll(LITERAL)) {
    if (index.keys.has(literal!)) keys.add(literal!);
  }
  for (const [, plain, single, template] of code.matchAll(NAMESPACE_CALL)) {
    const ns = plain ?? single ?? template;
    if (ns && index.namespaces.has(ns)) namespaces.add(ns);
  }
  for (const ns of namespaces) {
    for (const key of index.keys) if (key.startsWith(`${ns}.`)) keys.add(key);
  }
  return { keys: [...keys], namespaces: [...namespaces] };
};
