import type { InferThemeProps } from "../../resolver";
import type { RLMarqueeTheme } from "./marquee.theme";

export type RLMarqueeProps = Omit<
  InferThemeProps<typeof RLMarqueeTheme>,
  "direction" | "pauseOnHover"
> & {
  /**
   * Direction of marquee motion.
   *
   * @default "left"
   */
  direction?: "left" | "right" | "up" | "down";
  /**
   * Speed of animation in seconds (duration of scroll cycle). Omit to use the theme duration (40s).
   *
   * @default 40
   */
  speed?: number;
  /**
   * Whether to pause scroll animation on mouse hover.
   *
   * @default true
   */
  pauseOnHover?: boolean;
  /**
   * Gap between marquee items (e.g. "1rem" or 16). Omit to use the theme gap.
   *
   * @default undefined
   */
  gap?: string | number;
};
