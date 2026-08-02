export const cmsStatements = {
  page: ["create", "read", "update", "delete", "publish", "approve"],
  template: ["create", "read", "update", "delete", "instantiate"],
  draft: ["checkout", "edit", "release", "force_unlock"],
  version: ["create", "review", "approve", "publish"]
} as const

export interface UserSessionContext {
  userId: string
  roles: string[]
  permissions: string[]
}
