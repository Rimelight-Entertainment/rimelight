/// <reference types="astro/client" />


declare module "virtual:rimelight-ui" {
  import type { DefaultUIConfig } from "../themes"

  export function getUIConfig(): DefaultUIConfig & { colors?: string[] }
}

interface StarlightAddonsConfig {
  copy?: boolean
  share?: boolean
}

declare module "virtual:rimelight-ui-docs-meta" {
  const meta: Record<string, unknown>
  export default meta
}


declare namespace App {
  interface Locals {
    cfContext?: Record<string, unknown>
  }
}
