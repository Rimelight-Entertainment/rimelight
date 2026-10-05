import type { Theme } from "../../types";

export interface RLSurroundItem {
  label: string;
  href: string;
}

export interface RLSurroundProps {
  prev?: RLSurroundItem | null;
  next?: RLSurroundItem | null;
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
}
