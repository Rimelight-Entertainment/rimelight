import type { Plugin } from "vite-plus";
import { defineRimelightArtifactPlugin, serializeData } from "@rimelight/config";
import type { AuthPluginConfig } from "./types";

export type RimelightAuthPluginOptions = AuthPluginConfig;
export type RimelightAuthPlugin = Plugin;

export function auth(options: RimelightAuthPluginOptions = {}): RimelightAuthPlugin {
  const adapter = options.adapter || "cf-access";

  const adapterImport =
    adapter === "custom" && options.customModule
      ? `export * from ${JSON.stringify(options.customModule)};\nexport { default } from ${JSON.stringify(options.customModule)};`
      : adapter === "auth0"
        ? `import { createAuth0FromEnv } from "@rimelight/auth/auth0";\nexport const auth = createAuth0FromEnv(${serializeData({ devFallback: true, ...options })});\nexport const authAdapter = auth;\nexport default auth;`
        : adapter === "mock"
          ? `import { mockAuth } from "@rimelight/auth/mock";\nexport const auth = mockAuth(${serializeData(options)});\nexport const authAdapter = auth;\nexport default auth;`
          : `import { createCfAccessFromEnv } from "@rimelight/auth/cf-access";\nexport const auth = createCfAccessFromEnv(${serializeData(options)});\nexport const authAdapter = auth;\nexport default auth;`;

  return defineRimelightArtifactPlugin({
    name: "rimelight:auth",
    pkgName: "auth",
    aliases: {
      "#rimelight/auth/server": "auth.js",
      "#rimelight/auth/client": "client.js",
    },
    emit: () => ({
      "config.js": `export const config = ${serializeData(options)};\nexport default config;`,
      "config.d.ts": `export declare const config: any;\nexport declare const auth: any;\nexport declare const authAdapter: any;\ndeclare const _default: { config: any; auth: any; authAdapter: any };\nexport default _default;`,
      "auth.js": adapterImport,
      "auth.d.ts": `export declare const auth: any;\nexport declare const authAdapter: any;\ndeclare const _default: any;\nexport default _default;`,
      "client.js": `export * from "@rimelight/auth/client";\nexport { default } from "@rimelight/auth/client";`,
      "client.d.ts": `export * from "@rimelight/auth/client";\nexport { default } from "@rimelight/auth/client";`,
    }),
  });
}

export default auth;
