import { collectKeys } from "./typegen";

/** Every key `t()` accepts, plus every namespace above them (readable through `t.raw`). */
export interface KeyIndex {
  keys: Set<string>;
  namespaces: Set<string>;
}

/** The keys a source file refers to, directly or through a namespace. */
interface UsedKeys {
  keys: string[];
  namespaces: string[];
}

/** Single/double-quoted strings (kept so `https://` isn't mistaken for a comment) or JS comments. */
const STRING_OR_COMMENT = /(["'])(?:\\[\s\S]|(?!\1)[^\\\n])*?\1|\/\/[^\n]*|\/\*[\s\S]*?\*\//g;

/** Replaces line and block comments with a space while preserving quoted string literals. */
const stripComments = (source: string): string =>
  source.replace(STRING_OR_COMMENT, (match, quote) => (quote ? match : " "));

/** Quoted string literals made of key characters. A literal is a key only if it exactly names one. */
const LITERAL = /(["'`])([A-Za-z0-9_\-.]+)\1/g;

/**
 * Namespace reads: the first argument of `t(…)`, `t.raw(…)` or `t.array(…)` when it is a plain or
 * template string. Only these count as namespaces; common words such as "page" appear everywhere.
 */
const NAMESPACE_CALL =
  /\bt(?:\.raw|\.array)?(?:<[^>\n]*>)?\(\s*(?:"([A-Za-z0-9_\-.]+)"|'([A-Za-z0-9_\-.]+)'|`([A-Za-z0-9_\-.]+)\.\$\{)/g;

/** Namespace a key belongs to: `page.home` for `page.home.title`, otherwise the top-level segment. */
export const bucketOf = (key: string): string => {
  const parts = key.split(".");
  return parts[0] === "page" && parts.length > 2 ? `page.${parts[1]}` : parts[0]!;
};

export const indexKeys = (base: Record<string, unknown>): KeyIndex => {
  const keys = new Set(collectKeys(base).map((entry) => entry.key));
  const namespaces = new Set<string>();
  for (const key of keys) {
    const parts = key.split(".");
    for (let i = 1; i < parts.length; i++) namespaces.add(parts.slice(0, i).join("."));
  }
  return { keys, namespaces };
};

const usedKeys = (source: string, index: KeyIndex): UsedKeys => {
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

/** Module specifiers in static imports, re-exports, side-effect imports and dynamic imports. */
const SPECIFIER =
  /\bimport\b[^'"`;]*?["']([^"']+)["']|\bexport\b[^'"`;]*?from\s*["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']\s*\)/g;

export interface Resolver {
  /** Absolute, forward-slash id for a specifier, or `null` when it can't be resolved to a source file. */
  resolve: (specifier: string, importer: string) => Promise<string | null>;
  read: (id: string) => string;
}

/** A source module: its text and the source modules it imports. */
interface ModuleNode {
  source: string;
  deps: string[];
}

/**
 * Scanned modules by id. Keep one across runs and delete a module when its file changes: the rest
 * is reused, so re-analysis after an edit only reads and resolves what changed.
 */
export type ModuleGraph = Map<string, Promise<ModuleNode>>;

/** Route key for a route file: its path under `src/routes`, without extension. */
export const routeKey = (routesDir: string, file: string): string =>
  file
    .replace(/\\/g, "/")
    .slice(routesDir.replace(/\\/g, "/").length + 1)
    .replace(/\.[jt]sx?$/, "");

export interface Analysis {
  /** Namespaces each route needs, including its ancestor layouts and the global roots. */
  routes: Record<string, string[]>;
  /** Namespaces used by the global roots (app shell, document), needed by every route. */
  globals: string[];
}

const isSource = (id: string | null): id is string =>
  !!id && !id.includes("/node_modules/") && !id.includes("?") && /\.[jt]sx?$/.test(id);

const scan = (id: string, resolver: Resolver, graph: ModuleGraph): Promise<ModuleNode> => {
  let node = graph.get(id);
  if (!node) {
    node = (async () => {
      let source = "";
      try {
        source = stripComments(resolver.read(id));
      } catch {
        // Deleted or unreadable: it contributes nothing.
      }
      const specifiers = new Set([...source.matchAll(SPECIFIER)].map((m) => m[1] ?? m[2] ?? m[3]!));
      // Every import of a module resolves at once, not one after another.
      const deps = await Promise.all([...specifiers].map((s) => resolver.resolve(s, id)));
      return { source, deps: [...new Set(deps.filter(isSource))] };
    })();
    graph.set(id, node);
  }
  return node;
};

/** Scans `roots` and everything they import, in parallel. Returns the settled modules. */
const load = async (
  roots: Iterable<string>,
  resolver: Resolver,
  graph: ModuleGraph,
): Promise<Map<string, ModuleNode>> => {
  const settled = new Map<string, ModuleNode>();
  const started = new Set<string>();
  const visit = async (id: string): Promise<void> => {
    if (started.has(id)) return;
    started.add(id);
    const node = await scan(id, resolver, graph);
    settled.set(id, node);
    await Promise.all(node.deps.map(visit));
  };
  await Promise.all([...roots].map(visit));
  return settled;
};

/** Analyses every route (with its ancestor layouts) and the global roots. */
export const analyzeRoutes = async (
  routeFiles: Map<string, string>, // route key -> absolute file
  globalFiles: string[],
  index: KeyIndex,
  resolver: Resolver,
  graph: ModuleGraph = new Map(),
): Promise<Analysis> => {
  const files = new Set(routeFiles.values());
  const modules = await load([...globalFiles, ...files], resolver, graph);

  const keysOf = new Map<string, string[]>();
  const moduleKeys = (id: string) => {
    let keys = keysOf.get(id);
    if (!keys) {
      keys = usedKeys(modules.get(id)?.source ?? "", index).keys;
      keysOf.set(id, keys);
    }
    return keys;
  };

  /** Namespaces of every key `roots` reach. Other route files are not entered: each route has its own. */
  const closure = (roots: Set<string>): string[] => {
    const buckets = new Set<string>();
    const seen = new Set<string>();
    const stack = [...roots];
    while (stack.length) {
      const id = stack.pop()!;
      if (seen.has(id)) continue;
      seen.add(id);
      for (const key of moduleKeys(id)) buckets.add(bucketOf(key));
      for (const dep of modules.get(id)?.deps ?? []) {
        if (!files.has(dep) || roots.has(dep)) stack.push(dep);
      }
    }
    return [...buckets].sort();
  };

  const globals = closure(new Set(globalFiles));
  const routes: Record<string, string[]> = {};
  for (const [key, file] of routeFiles) {
    const roots = new Set([file]);
    // `[locale]/(app)/x` also renders `[locale]/(app).tsx` and `[locale].tsx` when they exist.
    const segments = key.split("/");
    for (let i = segments.length - 1; i > 0; i--) {
      const ancestor = routeFiles.get(segments.slice(0, i).join("/"));
      if (ancestor) roots.add(ancestor);
    }
    routes[key] = [...new Set([...closure(roots), ...globals])].sort();
  }
  return { routes, globals };
};

/**
 * Regex for the URL a route key serves, following the router's file convention: `(group)` segments
 * drop out, `index` disappears, `[param]` matches one segment, `[[param]]` matches zero or one, and
 * `[...rest]` matches the remainder (possibly empty).
 */
export const routePattern = (key: string): string => {
  const body = key
    .split("/")
    .filter((s) => s && !/^\(.*\)$/.test(s) && s !== "index")
    .map((s) =>
      /^\[\[?\.\.\./.test(s)
        ? "(?:/.*)?"
        : s.startsWith("[[")
          ? "(?:/[^/]+)?"
          : s.startsWith("[")
            ? "/[^/]+"
            : `/${s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
    )
    .join("");
  return `^${body}/?$`;
};
