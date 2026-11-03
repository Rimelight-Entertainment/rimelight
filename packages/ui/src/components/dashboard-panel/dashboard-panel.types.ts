import type { JSX } from "@solidjs/web";

export interface RLDashboardPanelProps {
  resizable?: boolean;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  ui?: any;
  class?: any;
  children?: JSX.Element;
  headerSlot?: JSX.Element;
  bodySlot?: JSX.Element;
  footerSlot?: JSX.Element;
  resizeHandleSlot?: JSX.Element;
  [key: string]: unknown;
}
