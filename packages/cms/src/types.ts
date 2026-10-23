import type { StorageConfig } from "./storage/index";
import type { AuthAdapter } from "@rimelight/auth";

export interface CmsConfig {
  routePrefix?: string | undefined;
  db?: string | undefined;
  storage?: StorageConfig | undefined;
  auth?: AuthAdapter | string | undefined;
  autoMigrate?: boolean | undefined;
}
