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

declare module "virtual:rimelight-ui-docs-meta" {
  const meta: Record<string, any>
  export default meta
}
