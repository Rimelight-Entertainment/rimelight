declare module "virtual:starlight-sidebar-topics/config" {
  import type { StarlightSidebarTopicsSharedConfig } from "./libs/config"
  const StarlightSidebarTopicsConfig: StarlightSidebarTopicsSharedConfig

  export default StarlightSidebarTopicsConfig
}

declare module "virtual:starlight-sidebar-topics/options" {
  import type { StarlightSidebarTopicsSharedOptions } from "./libs/config"
  const StarlightSidebarTopicsOptions: StarlightSidebarTopicsSharedOptions

  export default StarlightSidebarTopicsOptions
}
