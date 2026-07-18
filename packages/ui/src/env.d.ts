/// <reference types="astro/client" />

declare module "virtual:rimelight-ui" {
  import type { DefaultUIConfig } from "../themes"

  export function getUIConfig(): DefaultUIConfig & { colors?: string[] }
}
