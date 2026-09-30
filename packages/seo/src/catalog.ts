import type { ApiCatalog, ApiCatalogOptions } from "./types.js";

/**
 * Build RFC 9652 Application Linkset API Catalog. https://www.rfc-editor.org/rfc/rfc9652
 */
export function buildApiCatalog(options: ApiCatalogOptions): ApiCatalog {
  const { items } = options;
  return {
    "api-catalog": items,
  };
}
