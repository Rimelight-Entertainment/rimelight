import type { InferThemeProps } from "../../resolver";
import type { RLScrollToTopTheme } from "./scroll-to-top.theme";

export type ScrollState = {
  isVisible: boolean;
  scrollPercentage: number;
};

export type ScrollToTopGaugeVars = Record<`--rl-stt-${string}`, string>;

export type RLScrollToTopProps = InferThemeProps<typeof RLScrollToTopTheme> & {
  /**
   * The scroll distance in pixels after which the button becomes visible.
   * @default 200
   */
  threshold?: number | undefined;
  /**
   * The width of the progress ring in pixels.
   * @default 6
   */
  progressWidth?: number | undefined;
  /**
   * Whether to render the scroll progress ring.
   * @default true
   */
  hasProgress?: boolean | undefined;
};
