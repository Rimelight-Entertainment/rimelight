/// <reference types="astro/client" />

declare module "virtual:nuxt-ui-plugins" {
  import type { Plugin } from "vue"
  const plugin: Plugin
  export default plugin
}

declare module "virtual:rimelight-ui" {
  import type { DefaultUIConfig } from "../themes"

  export function getUIConfig(): DefaultUIConfig
}

interface StarlightAddonsConfig {
  copy?: boolean
  share?: boolean
}

declare module "virtual:rimelight-starlight-addons-config" {
  const config: StarlightAddonsConfig
  export default config
}

declare module "virtual:rimelight-ui-docs-meta" {
  const meta: Record<string, unknown>
  export default meta
}

declare module "turndown" {
  class TurndownService {
    constructor(options?: Record<string, unknown>)
    turndown(html: Node | string): string
    use(plugin: () => void): void
  }
  export default TurndownService
}

declare module "turndown-plugin-gfm" {
  export function gfm(): void
}

declare namespace App {
  interface Locals {
    cfContext?: Record<string, unknown>
    // Extended locals used by Starlight Addons for richer type safety
    starlightSidebarTopics?: any
    starlightRoute?: any
  }
}
