/// <reference types="vite-plus/client" />
/// <reference types="@solidjs/start/env" />

declare module "virtual:rimelight/ui" {
  import type { UIConfig } from "@rimelight/ui/types";
  const config: UIConfig;
  export default config;
}
