import type { Plugin } from "vite-plus";
import type { AuthPluginConfig } from "./types";

export type RimelightAuthPluginOptions = AuthPluginConfig;

export const VIRTUAL_ID = "virtual:rimelight-auth";
export const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;
export const VIRTUAL_SERVER_ID = "virtual:rimelight-auth/server";
export const RESOLVED_VIRTUAL_SERVER_ID = `\0${VIRTUAL_SERVER_ID}`;

export function auth(options: RimelightAuthPluginOptions = {}): Plugin {
  const adapter = options.adapter || "cf-access";

  const adapterImport =
    adapter === "custom" && options.customModule
      ? `export * from ${JSON.stringify(options.customModule)};\nexport { default } from ${JSON.stringify(options.customModule)};`
      : adapter === "auth0"
        ? `import { createAuth0FromEnv } from "@rimelight/auth/auth0";\nexport const auth = createAuth0FromEnv(${JSON.stringify({ devFallback: true, ...options })});\nexport const authAdapter = auth;\nexport default auth;`
        : adapter === "mock"
          ? `import { mockAuth } from "@rimelight/auth/mock";\nexport const auth = mockAuth(${JSON.stringify(options)});\nexport const authAdapter = auth;\nexport default auth;`
          : `import { createCfAccessFromEnv } from "@rimelight/auth/cf-access";\nexport const auth = createCfAccessFromEnv(${JSON.stringify(options)});\nexport const authAdapter = auth;\nexport default auth;`;

  return {
    name: "rimelight:auth",
    enforce: "pre",
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
      if (id === VIRTUAL_SERVER_ID) return RESOLVED_VIRTUAL_SERVER_ID;
      return null;
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) {
        return `export const config = ${JSON.stringify(options)};\nexport default config;`;
      }
      if (id === RESOLVED_VIRTUAL_SERVER_ID) {
        return adapterImport;
      }
      return null;
    },
  };
}
