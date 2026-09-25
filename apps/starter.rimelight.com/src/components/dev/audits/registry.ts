import { accordionAudit } from "./accordion.audit"
import type { ComponentAuditDefinition } from "./types"

export const COMPONENT_AUDITS: Record<string, ComponentAuditDefinition> = {
  accordion: accordionAudit
}

export const getAllAudits = (): ComponentAuditDefinition[] => Object.values(COMPONENT_AUDITS)

export const getAuditById = (id: string): ComponentAuditDefinition | undefined =>
  COMPONENT_AUDITS[id.toLowerCase()]
