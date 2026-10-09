import { hc } from "hono/client";
import type { CmsRouterType } from "../server/router";

export type { CmsRouterType };

/**
 * Pre-typed Hono RPC client for Rimelight CMS API endpoints.
 */
export function createCmsClient(baseUrl = "/api/cms", options?: Parameters<typeof hc>[1]) {
  return hc<CmsRouterType>(baseUrl, options);
}

export const cmsClient = createCmsClient();
