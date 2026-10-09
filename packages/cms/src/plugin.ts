import path from "node:path";
import fs from "node:fs";
import type { Plugin } from "vite-plus";
import { defineRimelightArtifactPlugin, serializeData } from "@rimelight/config";
import type { StorageConfig } from "./storage/index";
import type { AuthAdapter } from "@rimelight/auth";

export interface RimelightCmsPluginOptions {
  routePrefix?: string | undefined;
  db?: string | undefined;
  storage?: StorageConfig | undefined;
  auth?: AuthAdapter | string | undefined;
}

export type RimelightCmsPlugin = Plugin;

export function cms(options: RimelightCmsPluginOptions = {}): RimelightCmsPlugin {
  const storageConfig = {
    provider: options.storage?.provider ?? "r2",
    binding: options.storage?.binding ?? "BLOB",
    publicUrl: options.storage?.publicUrl,
    prefix: options.storage?.prefix ?? "media/",
  };
  const routePrefix = options.routePrefix ?? "/[locale]/cms";

  const resolveAuthCode = (rootDir: string): string => {
    if (typeof options.auth === "string") {
      const resolved = path.isAbsolute(options.auth)
        ? options.auth
        : path.resolve(rootDir, options.auth);
      if (fs.existsSync(resolved))
        return `export { authAdapter, authAdapter as default } from ${JSON.stringify(resolved)};`;
    }
    if (options.auth && typeof options.auth === "object") {
      const { name, adapter, options: opts = {} } = options.auth as any;
      const target = name || adapter || "mock";
      if (target === "cf-access")
        return `import { cfAccessAuth } from "@rimelight/auth/cf-access";\nexport const authAdapter = cfAccessAuth(${serializeData(opts)});\nexport default authAdapter;`;
      if (target === "auth0")
        return `import { createAuth0FromEnv } from "@rimelight/auth/auth0";\nexport const authAdapter = createAuth0FromEnv(${serializeData(opts)});\nexport default authAdapter;`;
      return `import { mockAuth } from "@rimelight/auth/mock";\nexport const authAdapter = mockAuth(${serializeData(opts)});\nexport default authAdapter;`;
    }
    return `import { authAdapter } from "#rimelight/auth";\nexport { authAdapter, authAdapter as default };`;
  };

  const resolveDbCode = (rootDir: string): string => {
    const candidates = options.db
      ? [path.isAbsolute(options.db) ? options.db : path.resolve(rootDir, options.db)]
      : [
          path.resolve(rootDir, "src/db/index.ts"),
          path.resolve(rootDir, "src/db/index.js"),
          path.resolve(rootDir, "src/db"),
        ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) return `export * from ${JSON.stringify(candidate)};`;
    }
    return `export const db = null;\nexport default null;`;
  };

  return defineRimelightArtifactPlugin({
    name: "rimelight:cms",
    pkgName: "cms",
    aliases: {
      "#rimelight/cms/client": "config.js",
      "#rimelight/cms/server": "config.js",
      "#rimelight/cms/config": "config.js",
      "#rimelight/cms/storage": "storage.js",
      "#rimelight/cms/auth": "auth.js",
      "#rimelight/cms/db": "db.js",
    },
    emit({ root }) {
      return {
        "config.js": `export const routePrefix = ${JSON.stringify(routePrefix)};\nexport const storageConfig = ${serializeData(storageConfig)};\nexport const cmsOptions = ${serializeData({ routePrefix, storage: storageConfig })};\nexport default cmsOptions;`,
        "config.d.ts": `export declare const routePrefix: string;\nexport declare const storageConfig: any;\nexport declare const cmsOptions: any;\nexport default cmsOptions;`,
        "storage.js": `export const storageConfig = ${serializeData(storageConfig)};\nexport default storageConfig;`,
        "storage.d.ts": `export declare const storageConfig: any;\nexport default storageConfig;`,
        "auth.js": resolveAuthCode(root),
        "auth.d.ts": `import type { AuthAdapter } from "@rimelight/auth";\nexport declare const authAdapter: AuthAdapter;\nexport default authAdapter;`,
        "db.js": resolveDbCode(root),
        "db.d.ts": `export declare const db: any;\nexport default null;`,
      };
    },
  });
}

export { cms as rimelightCmsPlugin };
