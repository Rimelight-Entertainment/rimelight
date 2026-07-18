/// <reference types="astro/client" />

declare module "virtual:rimelight-ui" {
  import type { UIConfigMap } from "../themes"

  export function getUIConfig(): UIConfigMap & { colors?: string[] }
}
