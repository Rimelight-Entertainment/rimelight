import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite-plus";

export interface RimelightArtifactFiles {
  [filename: string]: string;
}

export interface CodeGenExport {
  name: string;
  value?: unknown;
  importSpecifier?: { from: string; symbol?: string; isDefault?: boolean };
}

/**
 * Finds the appropriate node_modules directory for artifact generation.
 * 1. Checks if a local node_modules exists in startDir (app-local isolation).
 * 2. Traverses upward to find the closest existing node_modules directory (monorepo root).
 * 3. Falls back to creating a local node_modules directory if none exists.
 */
export function findNodeModulesRoot(startDir: string): string {
  const localCandidate = path.resolve(startDir, "node_modules");
  if (fs.existsSync(localCandidate) && fs.statSync(localCandidate).isDirectory()) {
    return localCandidate;
  }

  let current = path.resolve(startDir);
  while (true) {
    const candidate = path.join(current, "node_modules");
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      return candidate;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  fs.mkdirSync(localCandidate, { recursive: true });
  return localCandidate;
}

/**
 * Emits disk-backed artifacts only when content has changed to preserve filesystem mtime.
 */
export function emitRimelightArtifact(
  root: string,
  pkgName: string,
  files: RimelightArtifactFiles,
): { targetDir: string; changed: boolean } {
  const nodeModulesDir = findNodeModulesRoot(root);
  const targetDir = path.join(nodeModulesDir, ".rimelight", pkgName);
  fs.mkdirSync(targetDir, { recursive: true });

  let changed = false;
  for (const [filename, content] of Object.entries(files)) {
    const filePath = path.join(targetDir, filename);
    if (!fs.existsSync(filePath) || fs.readFileSync(filePath, "utf-8") !== content) {
      fs.writeFileSync(filePath, content, "utf-8");
      changed = true;
    }
  }

  return { targetDir, changed };
}

/**
 * Safely serializes configuration values into executable JavaScript code.
 * Preserves primitives, RegExps, Dates, Sets, Maps, arrays, and plain objects.
 * Throws actionable errors for closures/functions according to RFC §3.3.2.
 */
export function serializeData(value: unknown, path = "config"): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "bigint") return `${value.toString()}n`;

  if (typeof value === "function") {
    throw new Error(
      `[Rimelight Config] Functions cannot be serialized directly at "${path}". Pass an importSpecifier or a module path instead.`,
    );
  }

  if (typeof value === "symbol") {
    throw new Error(
      `[Rimelight Config] Symbols cannot be serialized into disk artifacts at "${path}".`,
    );
  }

  if (value instanceof RegExp) {
    return `new RegExp(${JSON.stringify(value.source)}, ${JSON.stringify(value.flags)})`;
  }

  if (value instanceof Date) {
    return `new Date(${JSON.stringify(value.toISOString())})`;
  }

  if (value instanceof Set) {
    return `new Set([${Array.from(value)
      .map((v, i) => serializeData(v, `${path}[${i}]`))
      .join(", ")}])`;
  }

  if (value instanceof Map) {
    const entries = Array.from(value.entries()).map(
      ([k, v]) =>
        `[${serializeData(k, `${path}.key`)}, ${serializeData(v, `${path}[${JSON.stringify(k)}]`)}]`,
    );
    return `new Map([${entries.join(", ")}])`;
  }

  if (Array.isArray(value)) {
    return `[${value.map((item, i) => serializeData(item, `${path}[${i}]`)).join(", ")}]`;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${JSON.stringify(k)}: ${serializeData(v, `${path}.${k}`)}`);
    return `{\n  ${entries.join(",\n  ")}\n}`;
  }

  return JSON.stringify(value);
}

/**
 * Normalizes and re-bases import specifiers for output inside node_modules/.rimelight/<pkg>.
 */
export function resolveImportSpecifier(from: string, rootDir: string, targetDir: string): string {
  if (from.startsWith(".")) {
    const absolutePath = path.resolve(rootDir, from);
    let relativePath = path.relative(targetDir, absolutePath).replace(/\\/g, "/");
    if (!relativePath.startsWith(".")) {
      relativePath = `./${relativePath}`;
    }
    return relativePath;
  }
  if (path.isAbsolute(from)) {
    let relativePath = path.relative(targetDir, from).replace(/\\/g, "/");
    if (!relativePath.startsWith(".")) {
      relativePath = `./${relativePath}`;
    }
    return relativePath;
  }
  return from.replace(/\\/g, "/");
}

export function generateESModule(
  exports: CodeGenExport[],
  options?: {
    rootDir?: string | undefined;
    targetDir?: string | undefined;
    defaultExportName?: string | undefined;
  },
): string {
  const imports: string[] = [];
  const declarations: string[] = [];
  const exportNames: string[] = [];

  const rootDir = options?.rootDir ?? process.cwd();
  const targetDir = options?.targetDir ?? rootDir;

  let importCounter = 0;
  for (const exp of exports) {
    if (exp.importSpecifier) {
      const alias = `_ref_${++importCounter}`;
      const { from, symbol, isDefault } = exp.importSpecifier;
      const rebasedFrom = resolveImportSpecifier(from, rootDir, targetDir);

      if (isDefault || !symbol) {
        imports.push(`import ${alias} from ${JSON.stringify(rebasedFrom)};`);
      } else {
        imports.push(`import { ${symbol} as ${alias} } from ${JSON.stringify(rebasedFrom)};`);
      }
      declarations.push(`export const ${exp.name} = ${alias};`);
      exportNames.push(exp.name);
    } else {
      declarations.push(`export const ${exp.name} = ${serializeData(exp.value, exp.name)};`);
      exportNames.push(exp.name);
    }
  }

  const defaultExport = options?.defaultExportName
    ? `export default ${options.defaultExportName};`
    : `export default { ${exportNames.join(", ")} };`;

  return [
    `// Auto-generated by Rimelight. Do not edit directly.`,
    ...imports,
    ...(imports.length ? [``] : []),
    ...declarations,
    ``,
    defaultExport,
  ].join("\n");
}

export interface ArtifactEmitResult {
  exports?: CodeGenExport[];
  types?: string;
  defaultExportName?: string;
  files?: Record<string, string>;
  subpath?: string;
}

export interface RimelightArtifactPluginOptions<T = any> {
  name?: string;
  pkgName: string;
  enforce?: "pre" | "post";
  aliases?: Record<string, string>;
  config?: T | ((ctx: { root: string }) => T);
  emit?: (ctx: { root: string; targetDir: string }) => ArtifactEmitResult | Record<string, string>;
  watch?: (string | RegExp)[] | ((ctx: { root: string }) => (string | RegExp)[]);
  closeBundle?: () => void | Promise<void>;
}

function isArtifactEmitResult(value: unknown): value is ArtifactEmitResult {
  return (
    typeof value === "object" &&
    value !== null &&
    ("exports" in value || "types" in value || "files" in value)
  );
}

/**
 * Standard plugin helper that emits disk-backed artifacts into node_modules/.rimelight/
 * and registers Vite aliases for #rimelight/<pkgName> and subpaths.
 */
export function defineRimelightArtifactPlugin<T = any>(
  options: RimelightArtifactPluginOptions<T>,
): Plugin {
  let root = process.cwd();
  let generatedDir = "";
  let configFilePath = "";

  function runEmit() {
    const nodeModules = findNodeModulesRoot(root);
    generatedDir = path.join(nodeModules, ".rimelight", options.pkgName);
    configFilePath = path.join(generatedDir, "config.js");

    let filesToEmit: Record<string, string> = {};

    if (options.config !== undefined) {
      const resolvedConfig =
        typeof options.config === "function" ? (options.config as any)({ root }) : options.config;

      const isObj =
        typeof resolvedConfig === "object" &&
        resolvedConfig !== null &&
        !Array.isArray(resolvedConfig);

      if (isObj) {
        const keys = Object.keys(resolvedConfig);
        const decls: string[] = [];
        const typeDecls: string[] = [];
        for (const k of keys) {
          decls.push(`export const ${k} = ${serializeData((resolvedConfig as any)[k], k)};`);
          typeDecls.push(`export declare const ${k}: any;`);
        }
        decls.push(`export const config = { ${keys.join(", ")} };`);
        decls.push(`export default config;`);
        typeDecls.push(`export declare const config: any;`);
        typeDecls.push(`export default config;`);

        filesToEmit["config.js"] = decls.join("\n");
        filesToEmit["config.d.ts"] = typeDecls.join("\n");
      } else {
        const serialized = serializeData(resolvedConfig);
        filesToEmit["config.js"] = `export const config = ${serialized};\nexport default config;`;
        filesToEmit["config.d.ts"] = `export declare const config: any;\nexport default config;`;
      }
    }

    if (options.emit) {
      const result = options.emit({ root, targetDir: generatedDir });
      if (isArtifactEmitResult(result)) {
        if (result.exports) {
          const subpathFile = result.subpath ?? "config.js";
          filesToEmit[subpathFile] = generateESModule(result.exports, {
            rootDir: root,
            targetDir: generatedDir,
            defaultExportName: result.defaultExportName,
          });
        }
        if (result.types) {
          const dtsFile = (result.subpath ?? "config.js").replace(/\.js$/, ".d.ts");
          filesToEmit[dtsFile] = result.types;
        }
        if (result.files) {
          filesToEmit = { ...filesToEmit, ...result.files };
        }
      } else {
        filesToEmit = { ...filesToEmit, ...result };
      }
    }

    emitRimelightArtifact(root, options.pkgName, filesToEmit);
  }

  const pluginName = options.name ?? `rimelight:${options.pkgName}`;

  const plugin: Plugin = {
    name: pluginName,
    enforce: options.enforce ?? "pre",

    config(userConfig) {
      root = userConfig.root ? path.resolve(userConfig.root) : process.cwd();
      runEmit();

      const aliases: Array<{ find: string | RegExp; replacement: string }> = [];

      if (options.aliases) {
        for (const [aliasKey, targetRelPath] of Object.entries(options.aliases)) {
          const replacement = (
            path.isAbsolute(targetRelPath) ? targetRelPath : path.join(generatedDir, targetRelPath)
          ).replace(/\\/g, "/");
          aliases.push({
            find: new RegExp(`^${aliasKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
            replacement,
          });
        }
      }

      const normalizedConfigPath = configFilePath.replace(/\\/g, "/");
      const normalizedGeneratedDir = generatedDir.replace(/\\/g, "/");

      // Exact match for `#rimelight/<pkgName>` -> config.js
      aliases.push({
        find: new RegExp(`^#rimelight/${options.pkgName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
        replacement: normalizedConfigPath,
      });

      // Match subpaths like `#rimelight/<pkgName>/<subpath>`
      aliases.push({
        find: new RegExp(
          `^#rimelight/${options.pkgName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/(.+)`,
        ),
        replacement: `${normalizedGeneratedDir}/$1`,
      });

      return {
        resolve: {
          alias: aliases,
        },
        server: {
          watch: {
            ignored: ["!**/node_modules/.rimelight/**"],
          },
        },
      };
    },

    configResolved(resolvedConfig) {
      root = resolvedConfig.root ? path.resolve(resolvedConfig.root) : process.cwd();
      runEmit();
    },

    resolveId(id) {
      if (id === `#rimelight/${options.pkgName}`) {
        return configFilePath;
      }
      if (id.startsWith(`#rimelight/${options.pkgName}/`)) {
        const subpath = id.slice(`#rimelight/${options.pkgName}/`.length);
        return path.join(generatedDir, subpath);
      }
      return null;
    },

    configureServer(server) {
      if (generatedDir) {
        server.watcher.add(generatedDir);
      }

      if (options.watch) {
        const watchPatterns =
          typeof options.watch === "function" ? options.watch({ root }) : options.watch;

        for (const pattern of watchPatterns) {
          if (typeof pattern === "string" && fs.existsSync(pattern)) {
            server.watcher.add(pattern);
          }
        }

        server.watcher.on("all", (_event, filePath) => {
          const shouldTrigger = watchPatterns.some((pattern) =>
            typeof pattern === "string" ? filePath.startsWith(pattern) : pattern.test(filePath),
          );

          if (shouldTrigger) {
            runEmit();
            const mod = server.moduleGraph.getModuleById(configFilePath);
            if (mod) server.moduleGraph.invalidateModule(mod);
            server.ws.send({ type: "full-reload" });
          }
        });
      }
    },
  };

  if (options.closeBundle) {
    plugin.closeBundle = options.closeBundle;
  }

  return plugin;
}
