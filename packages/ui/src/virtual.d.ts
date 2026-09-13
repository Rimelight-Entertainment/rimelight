declare module "virtual:rimelight/ui" {
  import type { UIConfig } from "./types"
  export default {} as UIConfig
}

declare module "*.vue" {
  import type { DefineComponent } from "vue"
  const component: DefineComponent<Record<string, any>, Record<string, any>, any>
  export default component
}
