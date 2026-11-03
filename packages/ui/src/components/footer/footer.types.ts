import type { JSX } from "@solidjs/web";
import type {} from "../../types";

export interface RLFooterProps {
  /**
   * Whether to contain the footer content within a max-width container.
   */
  contain?: boolean;
  /**
   * Theme mode override for the footer subtree ("dark" | "light").
   */
  theme?: "light" | "dark";
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  leftSlot?: JSX.Element;
  centerSlot?: JSX.Element;
  rightSlot?: JSX.Element;
  children?: JSX.Element;
  [key: string]: unknown;
}
