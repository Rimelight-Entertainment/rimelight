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
import { iconAudit } from "./icon.audit";
import { imageAudit } from "./image.audit";
import { mainAudit } from "./main.audit";
import { modalAudit } from "./modal.audit";
import { pageAudit } from "./page.audit";
import { pageSectionAudit } from "./page-section.audit";
import { routeAnnouncerAudit } from "./route-announcer.audit";
import { splitterAudit } from "./splitter.audit";
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
  icon: iconAudit,
  image: imageAudit,
  main: mainAudit,
  modal: modalAudit,
  page: pageAudit,
  "page-section": pageSectionAudit,
  "route-announcer": routeAnnouncerAudit,
  splitter: splitterAudit,
  resizable: splitterAudit,
  table: tableAudit,
};

export const getAllAudits = (): ComponentAuditDefinition[] => {
  const seen = new Set<string>();
  const list: ComponentAuditDefinition[] = [];
  for (const item of Object.values(COMPONENT_AUDITS)) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      list.push(item);
    }
  }
  return list;
};

export const getAuditById = (id: string): ComponentAuditDefinition | undefined =>
  COMPONENT_AUDITS[id.toLowerCase()];
