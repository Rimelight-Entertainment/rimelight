/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user?: (import("@rimelight/auth").UserSessionContext & { id: string }) | null | undefined
    session?:
      | { id: string; userId: string; roles: string[]; userType?: string | undefined }
      | null
      | undefined
    runtime?:
      | {
          env: Record<string, any>
        }
      | undefined
  }
}

// Enables importing `.astro` components inside `.ts` files (e.g., email rendering)
declare module "*.astro" {
  export default {} as import("astro/runtime/server").AstroComponentFactory
}

declare module "virtual:rimelight-ui-docs-meta" {
  const meta: Record<string, any>
  export default meta
}
