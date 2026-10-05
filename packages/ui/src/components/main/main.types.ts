import type { JSX } from "@solidjs/web";

export interface RLMainProps {
  /**
   * The element or component this component should render as.
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
  layerType?: "header" | "banner";
  left?: JSX.Element;
  center?: JSX.Element;
  right?: JSX.Element;
  children?: JSX.Element;
  [key: string]: unknown;
}
