declare module "virtual:rimelight-cms/parent-layout" {
  const layout: any
  export default layout
}

declare module "virtual:rimelight-cms/db" {
  export const db: any
}

declare module "virtual:rimelight-cms/storage" {
  export const storageConfig: any
}

declare module "virtual:rimelight-cms/auth" {
  import type { AuthAdapter } from "@rimelight/auth"
  export const authAdapter: AuthAdapter
  export default authAdapter
}

declare module "cloudflare:workers" {
  /**
   * Ambient Cloudflare Workers env — populated at runtime by the CF runtime.
   */
  export const env: Record<string, any>
}
