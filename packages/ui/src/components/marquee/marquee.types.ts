import type { JSX } from "@solidjs/web";

export interface RLMarqueeProps {
  /**
   * Direction of marquee motion.
   * @default "left"
   */
  direction?: "left" | "right" | "up" | "down";
  /**
   * Speed of animation in seconds (duration of scroll cycle).
   * @default 40
   */
  speed?: number;
  /**
   * Whether to pause scroll animation on mouse hover.
   * @default true
   */
  pauseOnHover?: boolean;
  /**
   * Gap between marquee items (e.g. "1rem" or 16).
   */
  gap?: string | number;
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
