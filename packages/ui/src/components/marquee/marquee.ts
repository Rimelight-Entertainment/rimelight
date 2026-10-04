import type { JSX } from "@solidjs/web";

export interface RLMarqueeProps {
  /**
   * Direction of marquee motion.
   */
  direction?: "left" | "right" | "up" | "down";
  /**
   * Speed of animation in seconds (duration of scroll cycle).
   */
  speed?: number;
  /**
   * Whether to pause scroll animation on mouse hover.
   */
  pauseOnHover?: boolean;
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
