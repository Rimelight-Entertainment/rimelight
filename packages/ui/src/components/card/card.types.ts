import type { JSX } from "@solidjs/web";

export interface RLCardProps {
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
  description?: string;
  href?: string;
  title?: any;
  titleStr?: string;
  mediaSrc?: string;
  overlay?: JSX.Element;
  media?: JSX.Element;
  variant?: string;
  theme?: string;
  [key: string]: unknown;
}
