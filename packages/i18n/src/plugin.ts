import fs from "node:fs";
import path from "node:path";
import type { Plugin, ViteDevServer } from "vite-plus";
import { DEFAULT_DIR, DEFAULT_TYPES } from "./constants";
import {
  analyzeRoutes,
  bucketOf,
  routeKey,
  routePattern,
  type ModuleGraph,
} from "./route-analysis";
import { indexKeys, type KeyIndex } from "./slices";
import type { I18nConfig } from "./types";
import { collectKeys, syncTypedKeys } from "./typegen";

const ID = "virtual:rimelight-i18n";
const RESOLVED_ID = `\0${ID}`;
const NAMESPACE_ID = `${ID}-ns/`;

interface I18nPluginOptions extends I18nConfig {
  /** Directory holding the `<locale>.json` files, relative to the project root. Default: `src/i18n`. */
  dir?: string;
  /** Typed `t()` keys output. `false` disables it. Default: `node_modules/.rimelight/types/i18n.d.ts`. */
  types?: string | false;
}

interface State {
  locales: Record<string, Record<string, unknown>>;
  index: KeyIndex;
  /** Namespaces each route needs, keyed by route key (path under `src/routes`). */
  routeBuckets: Record<string, string[]>;
  /** Namespaces used by the app shell and document, loaded for every route. */
  globalBuckets: string[];
}

const slash = (p: string): string => p.replace(/\\/g, "/");

const readJson = (file: string): Record<string, unknown> =>
  JSON.parse(fs.readFileSync(file, "utf-8"));

const walk = (dir: string): string[] =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return walk(full);
        return /\.[jt]sx?$/.test(entry.name) ? [slash(full)] : [];
      })
    : [];

export const i18n = ({
  dir = DEFAULT_DIR,
  translations,
  types,
  ...config
}: I18nPluginOptions = {}): Plugin => {
  const baseLocale = config.defaultLocale ?? "en";
  let root = process.cwd();
  let server: ViteDevServer | undefined;
  let state: State | undefined;

  const localesDir = () => path.resolve(root, dir);
  const srcDir = () => slash(path.resolve(root, "src"));
  const routesDir = () => `${srcDir()}/routes`;

  const readLocales = (): Record<string, Record<string, unknown>> =>
    translations ??
    Object.fromEntries(
      fs.existsSync(localesDir())
        ? fs
            .readdirSync(localesDir())
            .filter((f) => f.endsWith(".json"))
            .map((f) => [path.basename(f, ".json"), readJson(path.join(localesDir(), f))])
        : [],
    );

  /** Locale dictionaries, key index and typed keys. Cheap, so it runs at every build start. */
  const refresh = () => {
    const locales = readLocales();
    const index = indexKeys(locales[baseLocale] ?? {});
    state = {
      locales,
      index,
      routeBuckets: state?.routeBuckets ?? {},
      globalBuckets: state?.globalBuckets ?? [],
    };
    if (types !== false) {
      syncTypedKeys({ root, dir, baseLocale, translations, out: types ?? DEFAULT_TYPES });
    }
  };

  type ResolveContext = {
    resolve: (
      s: string,
      i: string,
      o: { skipSelf: boolean },
    ) => Promise<{ id: string; external?: boolean | "absolute" | "relative" } | null>;
  };

  /** Scanned modules, kept across analyses. A changed file drops only its own entry. */
  const graph: ModuleGraph = new Map();

  /**
   * The route map. The import walk is the slow part, so it runs the first time the client config is
   * loaded, and again only after a source or locale file it depends on changes.
   */
  let routesReady: Promise<void> | undefined;
  const ensureRoutes = (ctx: unknown) =>
    (routesReady ??= analyzeAll(ctx as Partial<ResolveContext>).catch((error: unknown) => {
      // Not cached: the next load retries.
      routesReady = undefined;
      throw error;
    }));

  const analyzeAll = async (ctx: Partial<ResolveContext>) => {
    const index = state?.index ?? indexKeys({});
    const routeFiles = new Map(
      walk(routesDir()).map((file) => [routeKey(routesDir(), file), file] as const),
    );
    // App shell and document render on every page, so their namespaces are needed everywhere.
    const globalFiles = ["App.tsx", "Document.tsx"]
      .map((f) => `${srcDir()}/${f}`)
      .filter((f) => fs.existsSync(f));
    const analysis = await analyzeRoutes(
      routeFiles,
      globalFiles,
      index,
      {
        // `this` is the plugin object when the CLI calls the hook directly, so check for the function itself.
        resolve: async (specifier, importer) => {
          if (typeof ctx.resolve !== "function") return null;
          const hit = await ctx.resolve(specifier, importer, { skipSelf: true });
          return hit && !hit.external ? slash(hit.id) : null;
        },
        read: (id) => fs.readFileSync(id, "utf-8"),
      },
      graph,
    );
    state = {
      locales: state?.locales ?? {},
      index,
      routeBuckets: analysis.routes,
      globalBuckets: analysis.globals,
    };
  };

  const buckets = (): string[] => [...new Set([...(state?.index.keys ?? [])].map(bucketOf))].sort();

  /**
   * Both sides start with empty dictionaries and one loader per namespace and locale. The client also
   * loads its URL's chunks before the app runs; the server's middleware does the same per request.
   */
  const configCode = (ssr: boolean): string => {
    const settings = `...${JSON.stringify(config)}`;
    const localeNames = Object.keys(state?.locales ?? {});
    const namespaces = buckets()
      .map((bucket) => {
        const loaders = localeNames
          .map(
            (l) =>
              `${JSON.stringify(l)}: () => import(${JSON.stringify(`${NAMESPACE_ID}${bucket}/${l}`)})`,
          )
          .join(", ");
        return `${JSON.stringify(bucket)}: { ${loaders} }`;
      })
      .join(", ");
    const patterns = Object.keys(state?.routeBuckets ?? {}).map(
      (key) => `[${JSON.stringify(key)}, new RegExp(${JSON.stringify(routePattern(key))})]`,
    );
    const exported = [
      `export const config = { ${settings}, translations: ${JSON.stringify(Object.fromEntries(localeNames.map((l) => [l, {}])))}, routeBuckets: ${JSON.stringify(state?.routeBuckets ?? {})}, globalBuckets: ${JSON.stringify(state?.globalBuckets ?? [])}, namespaces: { ${namespaces} }, patterns: [${patterns.join(", ")}], loaded: new Set() };`,
      "const merge = (target, source) => {",
      "  for (const [key, value] of Object.entries(source)) {",
      '    if (key === "__proto__") continue;',
      '    if (value && typeof value === "object" && !Array.isArray(value)) merge((target[key] ??= {}), value);',
      "    else target[key] = value;",
      "  }",
      "  return target;",
      "};",
      "// Initial load: fetch the namespaces of the URL being rendered before any module reads a translation.",
      'if (typeof window !== "undefined") {',
      "  const pathname = window.location.pathname;",
      "  const buckets = new Set(config.globalBuckets);",
      "  let matched = false;",
      "  for (const [key, re] of config.patterns) {",
      "    if (re.test(pathname)) {",
      "      matched = true;",
      "      for (const b of config.routeBuckets[key] ?? []) buckets.add(b);",
      "    }",
      "  }",
      "  if (!matched) {",
      "    for (const [key] of config.patterns) {",
      '      if (key === "404" || key.endsWith("/404")) {',
      "        for (const b of config.routeBuckets[key] ?? []) buckets.add(b);",
      "      }",
      "    }",
      "  }",
      "  const jobs = [];",
      "  for (const loc of Object.keys(config.translations)) {",
      "    for (const b of buckets) {",
      "      const load = config.namespaces[b]?.[loc];",
      "      if (load) {",
      "        jobs.push(load().then((m) => {",
      "          merge((config.translations[loc] ??= {}), m.default);",
      "          config.loaded.add(`${b}/${loc}`);",
      "        }));",
      "      }",
      "    }",
      "  }",
      "  await Promise.all(jobs);",
      "}",
    ];
    // The server has the same config without the client bootstrap: its pages load through the middleware.
    return (ssr ? exported.slice(0, 1) : exported).join("\n");
  };

  /**
   * One namespace in one locale, still nested: `page.home` becomes `{ page: { home: {...} } }`. Only the
   * keys in this namespace are included, so the `page` chunk doesn't also carry every `page.<x>` chunk.
   */
  const namespaceCode = (bucket: string, locale: string): string => {
    const dict = state?.locales[locale] ?? {};
    const out: Record<string, unknown> = {};
    for (const { key } of collectKeys(dict)) {
      if (bucketOf(key) !== bucket) continue;
      const parts = key.split(".");
      const last = parts.pop()!;
      let from = dict;
      let to = out;
      for (const part of parts) {
        from = from[part] as Record<string, unknown>;
        to = (to[part] ??= {}) as Record<string, unknown>;
      }
      to[last] = from[last];
    }
    return `export default ${JSON.stringify(out)};`;
  };

  /** Marks the config, and with `namespaces` every namespace chunk, for regeneration on the next load. */
  const invalidate = (namespaces: boolean) => {
    if (!server) return;
    for (const [id, mod] of server.moduleGraph.idToModuleMap) {
      if (id === RESOLVED_ID || (namespaces && id.startsWith(`\0${NAMESPACE_ID}`))) {
        server.moduleGraph.invalidateModule(mod);
      }
    }
  };

  return {
    name: "rimelight:i18n",
    configResolved: (resolved) => {
      root = resolved.root;
    },
    configureServer: (devServer) => {
      server = devServer;
    },
    buildStart: () => {
      refresh();
    },
    watchChange: (id, change) => {
      const file = slash(id);
      if (file.endsWith(".json") && slash(path.dirname(file)) === slash(localesDir())) {
        // New or removed keys can change which namespaces a module uses. The kept graph makes this cheap.
        refresh();
        routesReady = undefined;
        invalidate(true);
        return;
      }
      if (!/\.[jt]sx?$/.test(file) || !file.startsWith(`${srcDir()}/`)) return;
      if (change.event === "update") {
        // A module no route reaches can't change the route map.
        if (!graph.delete(file)) return;
      } else {
        // An added or removed file can change what other imports resolve to.
        graph.clear();
      }
      routesReady = undefined;
      invalidate(false);
    },
    resolveId: (id) => {
      if (id === ID) return RESOLVED_ID;
      if (id.startsWith(NAMESPACE_ID)) return `\0${id}`;
      return undefined;
    },
    load: async function (id, options) {
      if (id === RESOLVED_ID) {
        await ensureRoutes(this);
        return configCode(Boolean(options?.ssr));
      }
      if (id.startsWith(`\0${NAMESPACE_ID}`)) {
        const [bucket, locale] = id.slice(NAMESPACE_ID.length + 1).split("/") as [string, string];
        return namespaceCode(bucket, locale);
      }
      return undefined;
    },
  };
};
