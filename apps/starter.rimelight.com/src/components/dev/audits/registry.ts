import { accordionAudit } from "./accordion.audit";
import { aspectRatioAudit } from "./aspect-ratio.audit";
import { audioAudit } from "./audio.audit";
import { avatarAudit } from "./avatar.audit";
import { badgeAudit } from "./badge.audit";
import { bannerAudit } from "./banner.audit";
import { breadcrumbAudit } from "./breadcrumb.audit";
import { browserMockupAudit } from "./browser-mockup.audit";
import type { ComponentAuditDefinition } from "./types";

export const COMPONENT_AUDITS: Record<string, ComponentAuditDefinition> = {
  accordion: accordionAudit,
  "aspect-ratio": aspectRatioAudit,
  audio: audioAudit,
  avatar: avatarAudit,
  badge: badgeAudit,
  banner: bannerAudit,
  breadcrumb: breadcrumbAudit,
  "browser-mockup": browserMockupAudit,
};

export const getAllAudits = (): ComponentAuditDefinition[] => Object.values(COMPONENT_AUDITS);

export const getAuditById = (id: string): ComponentAuditDefinition | undefined =>
  COMPONENT_AUDITS[id.toLowerCase()];
