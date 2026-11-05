import type { AuthAdapter } from "./types";
import { createAuth0FromEnv } from "./adapters/auth0";
import { createCfAccessFromEnv } from "./adapters/cf-access";
import { config as pluginConfig } from "virtual:rimelight-auth";

const failClosed: AuthAdapter = {
  name: "none",
  async getSession() {
    return null;
  },
  async identify() {
    return null;
  },
};

let selected: AuthAdapter | null = null;

/**
 * The single identity provider for this deployment, set by the `auth()` Vite plugin's `provider`
 * option (`cf-access` | `auth0`). Unset, unknown or misconfigured means every request is anonymous.
 * Nothing falls back to another provider or to a default secret.
 */
export function getDefaultAuth(): AuthAdapter {
  if (selected) return selected;
  const raw = pluginConfig.provider;
  try {
    if (raw === "cf-access") selected = createCfAccessFromEnv();
    else if (raw === "auth0") selected = createAuth0FromEnv({ devFallback: true });
    else throw new Error(raw ? `unknown provider ${JSON.stringify(raw)}` : "not set");
  } catch (err) {
    console.error(`[auth] provider: ${(err as Error).message}. All requests are anonymous.`);
    selected = failClosed;
  }
  return selected;
}
