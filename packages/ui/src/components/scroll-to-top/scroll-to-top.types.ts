import type { ThemeColor } from "../../types";
import type { InferThemeProps } from "../../resolver";
import type { RLScrollToTopTheme } from "./scroll-to-top.theme";

export type RLScrollToTopProps = InferThemeProps<typeof RLScrollToTopTheme> & {
  /**
   * The color scheme applied to the scroll-to-top button.
   * @default "primary"
   */
  color?: ThemeColor | undefined;
  /**
   * The width of the progress indicator line in pixels.
   * @default 6
   */
  progressWidth?: number | undefined;
  /**
   * The scroll threshold in pixels before showing the button.
   * @default 200
   */
  threshold?: number | undefined;
  /**
   * Whether to show the scroll progress indicator.
   * @default true
   */
  showProgress?: boolean | undefined;
};
