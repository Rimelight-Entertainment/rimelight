import type { InferThemeProps } from "../../resolver";
import type { RLMarqueeTheme } from "./marquee.theme";

export type RLMarqueeProps = Omit<
  InferThemeProps<typeof RLMarqueeTheme>,
  "orientation" | "pauseOnHover"
> & {
  /**
   * Axis of marquee motion. `horizontal` scrolls along x, `vertical` along y.
   *
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Reverses the motion direction: right-to-left for horizontal, bottom-to-top for vertical.
   *
   * @default false
   */
  reverse?: boolean;
  /**
   * Speed of animation in seconds (duration of scroll cycle). Omit to use the theme duration (40s).
   *
   * @default 40
   */
  speed?: number;
  /**
   * Whether to pause scroll animation while the marquee is hovered.
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
  /** The root element owns its styling; `style` is not accepted. */
  style?: never;
};
