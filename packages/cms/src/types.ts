import type { StorageConfig } from "./storage/index";
import type { AuthAdapter } from "@rimelight/auth";

export interface CmsConfig {
  routePrefix?: string | undefined;
  db?: string | undefined;
  storage?: StorageConfig | undefined;
  auth?: AuthAdapter | string | undefined;
  /**
   * Automatically run pending CMS migrations on the first CMS request after
   * worker/server start. Read by the `cms()` Hono middleware via `virtual:rimelight-cms`.
   */
  autoMigrate?: boolean | undefined;
}
