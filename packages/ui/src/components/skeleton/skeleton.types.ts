import type { ParentProps } from "solid-js";
import type { SkeletonRect } from "./skeleton.dom";

export type { SkeletonRect };

export interface RLSkeletonProps extends ParentProps {
  /**
   * Whether the skeleton is in loading state.
   * If false and children are provided, children are rendered directly without skeleton overlay.
   * @default true
   */
  loading?: boolean;

  /**
   * The visual rounding variant.
   * When used as standalone skeleton, controls root element shape.
   * When wrapping children, acts as fallback rounding for unstyled leaf elements.
   * @default "rounded"
   */
  shape?: "circle" | "rectangle" | "rounded";

  /**
   * Custom fallback border radius in pixels when an element has 0px border-radius.
   * Defaults to shape preset or 4px.
   */
  fallbackBorderRadius?: number;

  /**
   * Optional custom inline styles or theme.
   */
  theme?: string;

  /**
   * Slot-specific CSS class overrides.
   */
  ui?: {
    root?: string;
    container?: string;
    measure?: string;
    overlay?: string;
    shimmer?: string;
    highlight?: string;
    [key: string]: unknown;
  };

  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;

  [key: string]: unknown;
}
