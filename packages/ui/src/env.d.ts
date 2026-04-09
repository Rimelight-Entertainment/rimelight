/// <reference types="astro/client" />

declare module "virtual:rimelight-ui" {
  import type { DefaultUIConfig } from "../themes"

  export function getUIConfig(): DefaultUIConfig
}

declare namespace App {
  interface Locals {
    uiLocale?: string
    translationLocale?: string
    isMissingContent?: boolean
    cfContext?: Record<string, unknown>
  }
}
