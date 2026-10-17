import type { Plugin } from "vite-plus";
import type { SecurityConfig } from "./types";
import { resolveSecurityDomain } from "./domain";
import { fetchRemoteSriManifest } from "./sri";

const ID = "virtual:rimelight-security";
const RESOLVED_ID = `\0${ID}`;

export function security(options: SecurityConfig = {}): Plugin {
  resolveSecurityDomain(options.domain);

  let sriManifest: Record<string, string> = {};
  const externalUrls = Array.from(new Set(options.resources || []));

  return {
    name: "rimelight:security",
    resolveId: (id) => (id === ID ? RESOLVED_ID : undefined),
    load: (id) =>
      id === RESOLVED_ID
        ? `export const config = ${JSON.stringify({ ...options, manifest: { ...sriManifest, ...options.manifest } })};`
        : undefined,

    async buildStart() {
      if (process.env["NODE_ENV"] === "development") return;
      sriManifest = await fetchRemoteSriManifest(externalUrls);
    },
  };
}
