import { accordionAudit } from "./accordion.audit";
import { aspectRatioAudit } from "./aspect-ratio.audit";
import { audioAudit } from "./audio.audit";
import { avatarAudit } from "./avatar.audit";
import { badgeAudit } from "./badge.audit";
import { bannerAudit } from "./banner.audit";
import { breadcrumbAudit } from "./breadcrumb.audit";
import { browserMockupAudit } from "./browser-mockup.audit";
import { buttonAudit } from "./button.audit";
import { calendarAudit } from "./calendar.audit";
import { calloutAudit } from "./callout.audit";
import { cardAudit } from "./card.audit";
import { carouselAudit } from "./carousel.audit";
import { checkboxAudit } from "./checkbox.audit";
import { chipAudit } from "./chip.audit";
import { collapsibleAudit } from "./collapsible.audit";
import { compareAudit } from "./compare.audit";
import { confirmAudit } from "./confirm.audit";
import { modalAudit } from "./modal.audit";
import { pageSectionAudit } from "./page-section.audit";
import { tableAudit } from "./table.audit";
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
  button: buttonAudit,
  calendar: calendarAudit,
  callout: calloutAudit,
  card: cardAudit,
  carousel: carouselAudit,
  checkbox: checkboxAudit,
  chip: chipAudit,
  collapsible: collapsibleAudit,
  compare: compareAudit,
  confirm: confirmAudit,
  modal: modalAudit,
  "page-section": pageSectionAudit,
  table: tableAudit,
};

export const getAllAudits = (): ComponentAuditDefinition[] => Object.values(COMPONENT_AUDITS);

export const getAuditById = (id: string): ComponentAuditDefinition | undefined =>
  COMPONENT_AUDITS[id.toLowerCase()];
