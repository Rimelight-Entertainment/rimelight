import type { JSX } from "@solidjs/web";

export interface RLDashboardPanelProps {
  resizable?: boolean;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  ui?: any;
  class?: any;
  children?: JSX.Element;
  header?: JSX.Element;
  headerSlot?: JSX.Element;
  body?: JSX.Element;
  bodySlot?: JSX.Element;
  footer?: JSX.Element;
  footerSlot?: JSX.Element;
  resizeHandle?: JSX.Element;
  resizeHandleSlot?: JSX.Element;
  [key: string]: unknown;
}
