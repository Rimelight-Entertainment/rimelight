import type { JSX } from "@solidjs/web";

export interface RLQuoteProps {
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  children?: JSX.Element;
  quote?: JSX.Element;
  caption?: JSX.Element;
  [key: string]: unknown;
}
