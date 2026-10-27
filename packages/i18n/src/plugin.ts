import fs from "node:fs";
import path from "node:path";
import type { Plugin, ViteDevServer } from "vite-plus";
import {
  analyzeRoutes,
  bucketOf,
  indexKeys,
  routeKey,
  routePattern,
  type KeyIndex,
  type ModuleGraph,
} from "./route-analysis";
import { DEFAULT_DIR, DEFAULT_TYPES } from "./shared";
import type { I18nConfig } from "./types";
import { collectKeys, readLocaleFiles, syncTypedKeys } from "./typegen";

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

/** Bucket -> the locales that have a chunk for it. */
type ChunkMap = Map<string, Set<string>>;

const slash = (p: string): string => p.replace(/\\/g, "/");

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
  let dev = false;
  let server: ViteDevServer | undefined;
  let state: State | undefined;

  const localesDir = () => path.resolve(root, dir);
  const srcDir = () => slash(path.resolve(root, "src"));
  const routesDir = () => `${srcDir()}/routes`;

  /** Locale dictionaries, key index and typed keys. Cheap, so it runs at every build start. */
  const refresh = () => {
    const locales = translations ?? readLocaleFiles(localesDir());
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

  const buckets = (): Set<string> => new Set([...(state?.index.keys ?? [])].map(bucketOf));

  const add = (map: ChunkMap, bucket: string, locale: string) => {
    (map.get(bucket) ?? map.set(bucket, new Set()).get(bucket)!).add(locale);
  };

  /**
   * Which chunks exist. A locale's own chunk per bucket, when it has keys there. A fallback chunk per
   * bucket, when it lacks some of the base locale's keys there: those values only, nothing it translates.
   * A chunk that would be empty is not emitted, so the client never requests it.
   */
  const chunkPlan = (): { own: ChunkMap; fallback: ChunkMap } => {
    const known = buckets();
    const locales = state?.locales ?? {};
    const baseKeys = collectKeys(locales[baseLocale] ?? {}).map((e) => e.key);
    const own: ChunkMap = new Map();
    const fallback: ChunkMap = new Map();
    for (const locale of Object.keys(locales)) {
      const keys = collectKeys(locales[locale]!).map((e) => e.key);
      const have = new Set(keys);
      for (const key of keys) if (known.has(bucketOf(key))) add(own, bucketOf(key), locale);
      if (locale === baseLocale) continue;
      for (const key of baseKeys) {
        if (!have.has(key) && known.has(bucketOf(key))) add(fallback, bucketOf(key), locale);
      }
    }
    return { own, fallback };
  };

  /** `namespaces` or `fallbacks`: each bucket's loaders, keyed by locale. */
  const loaderMap = (map: ChunkMap, suffix: string): string =>
    `{ ${[...map]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(
        ([bucket, locales]) =>
          `${JSON.stringify(bucket)}: { ${[...locales]
            .map(
              (l) =>
                `${JSON.stringify(l)}: () => import(${JSON.stringify(`${NAMESPACE_ID}${bucket}/${l}${suffix}`)})`,
            )
            .join(", ")} }`,
      )
      .join(", ")} }`;

  /**
   * Both sides get the same config: empty dictionaries, the route map, and a loader per chunk. The
   * client boots from it in the runtime, and the server loads each request's URL in the middleware.
   */
  const configCode = (): string => {
    const { own, fallback } = chunkPlan();
    const localeNames = Object.keys(state?.locales ?? {});
    const patterns = Object.keys(state?.routeBuckets ?? {}).map(
      (key) => `[${JSON.stringify(key)}, new RegExp(${JSON.stringify(routePattern(key))})]`,
    );
    return `export const config = { ...${JSON.stringify(config)}, devServer: ${dev}, translations: ${JSON.stringify(Object.fromEntries(localeNames.map((l) => [l, {}])))}, routeBuckets: ${JSON.stringify(state?.routeBuckets ?? {})}, globalBuckets: ${JSON.stringify(state?.globalBuckets ?? [])}, namespaces: ${loaderMap(own, "")}, fallbacks: ${loaderMap(fallback, "/fallback")}, patterns: [${patterns.join(", ")}], loaded: new Set() };`;
  };

  /**
   * One chunk, still nested: `page.home` becomes `{ page: { home: {...} } }`, so the `page` chunk doesn't
   * also carry every `page.<x>` chunk. A fallback chunk takes the base locale's values for the keys
   * `locale` lacks; an own chunk takes the locale's own keys.
   */
  const namespaceCode = (bucket: string, locale: string, fallback: boolean): string => {
    const locales = state?.locales ?? {};
    const dict = locales[locale] ?? {};
    const source = fallback ? (locales[baseLocale] ?? {}) : dict;
    const have = new Set(collectKeys(dict).map((e) => e.key));
    const out: Record<string, unknown> = {};
    for (const { key } of collectKeys(source)) {
      if (bucketOf(key) !== bucket || (fallback && have.has(key))) continue;
      const parts = key.split(".");
      const last = parts.pop()!;
      let from = source;
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
      dev = resolved.command === "serve";
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
    load: async function (id) {
      if (id === RESOLVED_ID) {
        await ensureRoutes(this);
        return configCode();
      }
      if (id.startsWith(`\0${NAMESPACE_ID}`)) {
        const [bucket, locale, kind] = id.slice(NAMESPACE_ID.length + 1).split("/") as [
          string,
          string,
          string | undefined,
        ];
        return namespaceCode(bucket, locale, kind === "fallback");
      }
      return undefined;
    },
  };
};
