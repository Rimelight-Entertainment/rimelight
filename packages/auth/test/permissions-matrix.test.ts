import { describe, expect, it } from "vite-plus/test"
import {
  hasRole,
  hasPermission,
  evaluateAccess,
  createAccessControl,
  createPermissions,
  defaultStatements,
  ownerAc,
  adminAc,
  memberAc
} from "../src/permissions"
import type { UserSessionContext } from "../src/types"

describe("@rimelight/auth - Permissions and Access Control Strict Matrix", () => {
  const adminSession: UserSessionContext = {
    userId: "user_admin",
    roles: ["admin", "staff"],
    permissions: ["*"]
  }

  const editorSession: UserSessionContext = {
    userId: "user_editor",
    roles: ["editor"],
    permissions: ["posts:*", "comments:read", "comments:write"]
  }

  const readerSession: UserSessionContext = {
    userId: "user_reader",
    roles: ["reader", "guest"],
    permissions: ["posts:read", "comments:read"]
  }

  const emptySession: UserSessionContext = {
    userId: "user_empty",
    roles: [],
    permissions: []
  }

  describe("hasRole strict checks", () => {
    it("handles null, undefined, and empty session gracefully", () => {
      expect(hasRole(null, "admin")).toBe(false)
      expect(hasRole(undefined, "admin")).toBe(false)
      expect(hasRole(emptySession, "admin")).toBe(false)
    })

    it("matches roles case-insensitively", () => {
      expect(hasRole(adminSession, "ADMIN")).toBe(true)
      expect(hasRole(adminSession, "Admin")).toBe(true)
      expect(hasRole(adminSession, "staff")).toBe(true)
      expect(hasRole(adminSession, "STAFF")).toBe(true)
    })

    it("evaluates wildcard role correctly", () => {
      expect(hasRole(readerSession, "*")).toBe(true)
      expect(hasRole(emptySession, "*")).toBe(false)
    })

    it("evaluates role array unions", () => {
      expect(hasRole(readerSession, ["superadmin", "reader"])).toBe(true)
      expect(hasRole(readerSession, ["superadmin", "editor"])).toBe(false)
    })
  })

  describe("hasPermission strict checks", () => {
    it("handles null, undefined, and empty sessions", () => {
      expect(hasPermission(null, "posts:read")).toBe(false)
      expect(hasPermission(undefined, "posts:read")).toBe(false)
      expect(hasPermission(emptySession, "posts:read")).toBe(false)
    })

    it("evaluates wildcard permissions", () => {
      expect(hasPermission(adminSession, "anything:at:all")).toBe(true)
      expect(hasPermission(adminSession, "billing:delete")).toBe(true)
    })

    it("evaluates resource-scoped wildcards", () => {
      expect(hasPermission(editorSession, "posts:create")).toBe(true)
      expect(hasPermission(editorSession, "posts:delete")).toBe(true)
      expect(hasPermission(editorSession, "comments:read")).toBe(true)
      expect(hasPermission(editorSession, "comments:delete")).toBe(false)
      expect(hasPermission(editorSession, "users:read")).toBe(false)
    })

    it("evaluates exact permissions", () => {
      expect(hasPermission(readerSession, "posts:read")).toBe(true)
      expect(hasPermission(readerSession, "posts:write")).toBe(false)
      expect(hasPermission(readerSession, "comments:read")).toBe(true)
    })
  })

  describe("evaluateAccess composite checks", () => {
    it("evaluates combinations of roles and permissions", () => {
      expect(
        evaluateAccess(editorSession, {
          roles: ["editor", "admin"],
          permission: "posts:edit"
        })
      ).toBe(true)

      expect(
        evaluateAccess(editorSession, {
          roles: ["admin"],
          permission: "posts:edit"
        })
      ).toBe(false)

      expect(
        evaluateAccess(editorSession, {
          roles: ["editor"],
          permission: "users:ban"
        })
      ).toBe(false)
    })

    it("passes when no constraints are specified", () => {
      expect(evaluateAccess(emptySession, {})).toBe(true)
      expect(evaluateAccess(null, {})).toBe(true)
    })
  })

  describe("AccessControl and createPermissions builder", () => {
    it("creates custom AC with statement types and permissions", () => {
      const { ac } = createPermissions({
        document: ["create", "edit", "publish", "delete"],
        billing: ["view", "charge"]
      })

      const customEditor = ac.newRole({
        document: ["create", "edit"],
        billing: ["view"]
      })

      expect(customEditor.can("document", "create")).toBe(true)
      expect(customEditor.can("document", "edit")).toBe(true)
      expect(customEditor.can("document", "publish")).toBe(false)
      expect(customEditor.can("document", "delete")).toBe(false)
      expect(customEditor.can("billing", "view")).toBe(true)
      expect(customEditor.can("billing", "charge")).toBe(false)
    })

    it("supports wildcard actions in role statements", () => {
      const ac = createAccessControl({
        media: ["upload", "delete", "view"] as const
      })

      const mediaAdmin = ac.newRole({
        media: ["*"]
      })

      expect(mediaAdmin.can("media", "upload")).toBe(true)
      expect(mediaAdmin.can("media", "delete")).toBe(true)
      expect(mediaAdmin.can("media", "unknown_action")).toBe(true)
      expect(mediaAdmin.can("unregistered_resource", "upload")).toBe(false)
    })

    it("validates predefined default role statements", () => {
      expect(defaultStatements.user).toContain("create")
      expect(defaultStatements.user).toContain("ban")
      expect(defaultStatements.user).toContain("impersonate")

      expect(ownerAc.statements.user).toEqual(defaultStatements.user)
      expect(adminAc.statements.user).toEqual(defaultStatements.user)
      expect(memberAc.statements.user).toEqual(["create", "list"])
    })
  })
})
