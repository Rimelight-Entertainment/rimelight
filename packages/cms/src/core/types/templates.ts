import type { BaseBlock } from "./blocks"
import type { Localized, PageType } from "./pages"

export interface TemplateApprovalRules {
  minApprovals?: number
  allowSelfApproval?: boolean
  requiredRolesForApproval?: string[]
}

export interface PageTemplate {
  id: string
  slug: string
  title: Localized
  description?: Localized
  pageType: PageType
  version: number
  allowedRoles: string[]
  requiredPermission?: string | null
  approvalRules: TemplateApprovalRules
  defaultProperties: Record<string, any>
  initialBlocks: BaseBlock[]
  createdAt?: Date
  updatedAt?: Date
}
