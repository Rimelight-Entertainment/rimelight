import type { JSX } from "@solidjs/web";

export interface RLStickySurfaceProps {
  stuckShadow?: boolean;
  /**
   * Pixels offset from top when sticky.
   */
  offsetTop?: number;
  /**
   * Z-index layer depth.
   */
  zIndex?: number;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  children?: JSX.Element;
  [key: string]: unknown;
}
