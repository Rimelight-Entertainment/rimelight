import type { JSX } from "@solidjs/web";

export interface RLSeparatorProps {
  color?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  type?: "solid" | "dashed" | "dotted";
  position?: "start" | "center" | "end";
  /**
   * The visual layout orientation.
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Whether to treat as purely decorative (hides from accessibility tree).
   */
  decorative?: boolean;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  children?: JSX.Element;
  avatarSlot?: JSX.Element;
  iconSlot?: JSX.Element;
  label?: any;
  icon?: string;
  avatar?: string | Record<string, any>;
  [key: string]: unknown;
}
