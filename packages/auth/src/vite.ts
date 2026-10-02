import type { Plugin } from "vite-plus";
import type { AuthPluginConfig } from "./types";

export type RimelightAuthPluginOptions = AuthPluginConfig;
export type RimelightAuthPlugin = Plugin;

/**
 * Pure Vite Auth Plugin for Rimelight applications.
 *
 * Exposes virtual modules:
 *
 * - `virtual:rimelight-auth` (alias `#auth/auth`, `#auth`)
 * - `virtual:rimelight-auth-client` (alias `#auth/auth-client`)
 * - `virtual:rimelight-auth-config`
 */
export function auth(options: RimelightAuthPluginOptions = {}): RimelightAuthPlugin {
  const adapter = options.adapter || "cf-access";

  const virtualAuthId = "virtual:rimelight-auth";
  const resolvedVirtualAuthId = "\0" + virtualAuthId;

  const virtualClientId = "virtual:rimelight-auth-client";
  const resolvedVirtualClientId = "\0" + virtualClientId;

  const virtualConfigId = "virtual:rimelight-auth-config";
  const resolvedVirtualConfigId = "\0" + virtualConfigId;

  return {
    name: "vite-plugin-rimelight-auth",

    resolveId(id: string) {
      if (id === virtualAuthId || id === "#auth" || id === "#auth/auth") {
        return resolvedVirtualAuthId;
      }
      if (id === virtualClientId || id === "#auth/auth-client") {
        return resolvedVirtualClientId;
      }
      if (id === virtualConfigId) {
        return resolvedVirtualConfigId;
      }
      return null;
    },

    load(id: string) {
      if (id === resolvedVirtualConfigId) {
        return `export const config = ${JSON.stringify(options)};`;
      }

      if (id === resolvedVirtualClientId) {
        return `
import { createAuthClient, authClient } from "@rimelight/auth/client";
export { createAuthClient, authClient };
export default authClient;
`;
      }

      if (id === resolvedVirtualAuthId) {
        if (adapter === "custom" && options.customModule) {
          return `
export * from "${options.customModule}";
export { default } from "${options.customModule}";
`;
        }

        if (adapter === "auth0") {
          return `
import { createAuth0FromEnv } from "@rimelight/auth/auth0";
export const auth = createAuth0FromEnv(${JSON.stringify({ devFallback: true, ...options })});
export const authAdapter = auth;
export default auth;
`;
        }

        if (adapter === "mock") {
          return `
import { mockAuth } from "@rimelight/auth/mock";
export const auth = mockAuth(${JSON.stringify(options)});
export const authAdapter = auth;
export default auth;
`;
        }

        // Default to Cloudflare Access
        return `
import { createCfAccessFromEnv } from "@rimelight/auth/cf-access";
export const auth = createCfAccessFromEnv(${JSON.stringify(options)});
export const authAdapter = auth;
export default auth;
`;
      }

      return null;
    },
  };
}
