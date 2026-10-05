import type { JSX } from "@solidjs/web";

export interface RLHeaderProps {
  /**
   * The element or component this component should render as.
   *
   * @default "header"
   */
  as?: any;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  children?: JSX.Element;
  contain?: boolean;
  sticky?: boolean;
  fixed?: boolean;
  stackIndex?: number;
  hideOnScroll?: boolean;
  layerType?: "header" | "banner";
  left?: JSX.Element;
  center?: JSX.Element;
  right?: JSX.Element;
  [key: string]: unknown;
}
