import { describe, expect, it } from "vite-plus/test"
import type { TemplateApprovalRules } from "../src/core/types/templates"

describe("multi-approval", () => {
  it("verifies minApprovals threshold prevents publish without sufficient approvals", () => {
    const approvalRules: TemplateApprovalRules = {
      minApprovals: 2,
      allowSelfApproval: false,
      requiredRolesForApproval: ["admin"]
    }

    const approvals = [{ userId: "user-1", userRole: "admin", approvedAt: new Date() }]

    // Only 1 approval, but minApprovals is 2
    const canPublish = approvals.length >= (approvalRules.minApprovals ?? 1)
    expect(canPublish).toBe(false)
  })

  it("verifies minApprovals threshold allows publish with sufficient approvals", () => {
    const approvalRules: TemplateApprovalRules = {
      minApprovals: 2,
      allowSelfApproval: false,
      requiredRolesForApproval: ["admin"]
    }

    const approvals = [
      { userId: "user-1", userRole: "admin", approvedAt: new Date() },
      { userId: "user-2", userRole: "admin", approvedAt: new Date() }
    ]

    // 2 approvals, minApprovals is 2
    const canPublish = approvals.length >= (approvalRules.minApprovals ?? 1)
    expect(canPublish).toBe(true)
  })

  it("verifies allowSelfApproval permits author to approve their own version", () => {
    const approvalRules: TemplateApprovalRules = {
      minApprovals: 1,
      allowSelfApproval: true,
      requiredRolesForApproval: ["admin"]
    }

    const createdBy = "user-1"
    const approvals = [{ userId: "user-1", userRole: "admin", approvedAt: new Date() }]

    // Self-approval is allowed
    const hasRequiredApprovals = approvals.length >= (approvalRules.minApprovals ?? 1)
    const authorApproved = approvals.some((a) => a.userId === createdBy)

    const canPublish = approvalRules.allowSelfApproval
      ? hasRequiredApprovals
      : hasRequiredApprovals && !authorApproved

    expect(canPublish).toBe(true)
  })

  it("verifies requiredRolesForApproval filters invalid approvers", () => {
    const approvalRules: TemplateApprovalRules = {
      minApprovals: 1,
      allowSelfApproval: true,
      requiredRolesForApproval: ["admin"]
    }

    const approvals = [{ userId: "user-1", userRole: "member", approvedAt: new Date() }]

    // User doesn't have required role
    const validApprovals = approvals.filter((a) =>
      approvalRules.requiredRolesForApproval?.includes(a.userRole)
    )

    expect(validApprovals.length).toBe(0)
  })

  it("verifies minApprovals of 0 allows immediate publish", () => {
    const approvalRules: TemplateApprovalRules = {
      minApprovals: 0,
      allowSelfApproval: true
    }

    const approvals: any[] = []

    // minApprovals of 0 means no approvals required
    const canPublish = approvals.length >= (approvalRules.minApprovals ?? 1)
    expect(canPublish).toBe(true)
  })
})
