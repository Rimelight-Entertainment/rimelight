import type { JSX } from "@solidjs/web";

export interface RLDashboardToolbarProps {
  as?: string;
  ui?: any;
  class?: any;
  children?: JSX.Element;
  leftSlot?: JSX.Element;
  rightSlot?: JSX.Element;
  [key: string]: unknown;
}
