import type { Theme } from "../../types";

export interface RLToasterProps {
  /**
   * Theme mode override — pins colors to flat, light, or dark mode.
   */
  theme?: Theme | undefined;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  [key: string]: unknown;
}
