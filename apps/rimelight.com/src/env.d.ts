/// <reference types="vite-plus/client" />
/// <reference types="@solidjs/start/env" />
/// <reference types="@rimelight/seo/client" />

declare module "virtual:rimelight/ui" {
  import type { UIConfig } from "@rimelight/ui/types";
  const config: UIConfig;
  export default config;
}

declare module "virtual:audits/colors" {
  const colors: string[];
  export default colors;
}
