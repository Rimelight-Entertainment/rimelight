import { describe, expect, it } from "vite-plus/test";
import { evaluateAccess, hasPermission, hasRole } from "../src/permissions/index";
import type { UserSessionContext } from "../src/types";

describe("RBAC Permissions and Role Evaluator", () => {
  const adminSession: UserSessionContext = {
    userId: "u1",
    roles: ["admin"],
    permissions: ["*"],
    userType: "employee",
  };

  const editorSession: UserSessionContext = {
    userId: "u2",
    roles: ["editor"],
    permissions: ["page:create", "page:update", "page:read"],
    userType: "employee",
  };

  const viewerSession: UserSessionContext = {
    userId: "u3",
    roles: ["viewer"],
    permissions: ["page:read"],
    userType: "user",
  };

  it("evaluates hasRole correctly", () => {
    expect(hasRole(adminSession, "admin")).toBe(true);
    expect(hasRole(adminSession, ["ADMIN"])).toBe(true);
    expect(hasRole(editorSession, ["admin", "editor"])).toBe(true);
    expect(hasRole(viewerSession, "admin")).toBe(false);
    expect(hasRole(null, "admin")).toBe(false);
  });

  it("evaluates hasPermission correctly with wildcards", () => {
    expect(hasPermission(adminSession, "page:delete")).toBe(true);
    expect(hasPermission(editorSession, "page:create")).toBe(true);
    expect(hasPermission(editorSession, "page:delete")).toBe(false);
    expect(hasPermission(viewerSession, "page:read")).toBe(true);
    expect(hasPermission(viewerSession, "page:create")).toBe(false);
    expect(hasPermission(null, "page:read")).toBe(false);
  });

  it("evaluates combined access constraints", () => {
    expect(evaluateAccess(adminSession, { roles: ["admin"], permission: "page:create" })).toBe(
      true,
    );
    expect(evaluateAccess(editorSession, { roles: ["admin"] })).toBe(false);
    expect(evaluateAccess(editorSession, { roles: ["editor"], permission: "page:create" })).toBe(
      true,
    );
    expect(evaluateAccess(viewerSession, { roles: ["editor"], permission: "page:read" })).toBe(
      false,
    );
  });
});
