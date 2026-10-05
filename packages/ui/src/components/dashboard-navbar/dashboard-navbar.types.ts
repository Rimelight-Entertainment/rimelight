import type { JSX } from "@solidjs/web";

export interface RLDashboardNavbarProps {
  as?: any;
  icon?: string;
  title?: string;
  toggle?: boolean;
  toggleSide?: "left" | "right";
  ui?: any;
  class?: any;
  children?: JSX.Element;
  leftSlot?: JSX.Element;
  rightSlot?: JSX.Element;
  centerSlot?: JSX.Element;
  titleSlot?: JSX.Element;
  leadingSlot?: JSX.Element;
  trailingSlot?: JSX.Element;
  [key: string]: unknown;
}
