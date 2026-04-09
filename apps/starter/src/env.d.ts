/// <reference types="astro/client" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PROD: boolean
  readonly DEV: boolean
  readonly TURNSTILE_SITE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "~icons/*" {
  import type { AstroComponentFactory } from "astro/runtime/server/index.js"
  const component: AstroComponentFactory
  export default component
}

declare module "virtual:rimelight-ui" {
  export function getUIConfig(): Record<string, unknown>
}

declare module "*.vue" {
  import type { DefineComponent } from "vue"
  const component: DefineComponent<object, object, unknown>
  export default component
}
