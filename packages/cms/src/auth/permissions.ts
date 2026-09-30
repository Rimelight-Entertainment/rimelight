export const cmsStatements = {
  page: ["create", "read", "update", "delete", "publish", "approve"],
  template: ["create", "read", "update", "delete", "instantiate"],
  draft: ["checkout", "edit", "release", "force_unlock"],
  version: ["create", "review", "approve", "publish"],
} as const;

export const cmsAc = {
  page: {
    read: ["admin", "editor"],
    update: ["admin", "editor"],
    delete: ["admin"],
    publish: ["admin"],
    approve: ["admin"],
  },
  template: {
    read: ["admin", "editor"],
    update: ["admin"],
    delete: ["admin"],
    instantiate: ["admin", "editor"],
  },
  draft: {
    checkout: ["admin", "editor"],
    edit: ["admin", "editor"],
    release: ["admin", "editor"],
    force_unlock: ["admin"],
  },
  version: {
    create: ["admin", "editor"],
    review: ["admin", "editor"],
    approve: ["admin"],
    publish: ["admin"],
  },
} as const;

export interface UserSessionContext {
  userId: string;
  roles: string[];
  permissions: string[];
}
