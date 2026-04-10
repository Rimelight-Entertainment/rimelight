/// <reference types="astro/client" />

declare module "virtual:rimelight-ui" {
  import type { DefaultUIConfig } from "../themes"

  export function getUIConfig(): DefaultUIConfig
}

declare namespace App {
  interface Locals {
    cfContext?: Record<string, unknown>
  }
}
