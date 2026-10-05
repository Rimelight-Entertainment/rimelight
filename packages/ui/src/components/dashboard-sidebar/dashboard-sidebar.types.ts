import type { JSX } from "@solidjs/web";

export interface RLDashboardSidebarProps {
  side?: "left" | "right";
  collapsible?: boolean;
  collapsed?: boolean;
  resizable?: boolean;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  collapsedSize?: number;
  ui?: any;
  class?: any;
  children?: JSX.Element;
  headerSlot?: JSX.Element;
  footerSlot?: JSX.Element;
  openMobile?: boolean;
  onOpenMobileChange?: (open: boolean) => void;
  onCollapseChange?: (collapsed: boolean) => void;
  [key: string]: unknown;
}
