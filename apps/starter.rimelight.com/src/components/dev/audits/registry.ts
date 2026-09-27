import { accordionAudit } from "./accordion.audit"
import { aspectRatioAudit } from "./aspect-ratio.audit"
import { audioAudit } from "./audio.audit"
import type { ComponentAuditDefinition } from "./types"

export const COMPONENT_AUDITS: Record<string, ComponentAuditDefinition> = {
  "accordion": accordionAudit,
  "aspect-ratio": aspectRatioAudit,
  "audio": audioAudit
}

export const getAllAudits = (): ComponentAuditDefinition[] => Object.values(COMPONENT_AUDITS)

export const getAuditById = (id: string): ComponentAuditDefinition | undefined =>
  COMPONENT_AUDITS[id.toLowerCase()]
