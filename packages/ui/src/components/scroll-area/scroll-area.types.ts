import type { InferThemeProps } from "../../resolver";
import type { RLScrollAreaTheme } from "./scroll-area.theme";

export type RLScrollAreaProps = Omit<
  InferThemeProps<typeof RLScrollAreaTheme>,
  "visible" | "sized"
> & {
  /**
   * Which scrollbars are rendered. `both` renders vertical and horizontal bars.
   *
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal" | "both";
  /**
   * Scrollbar visibility delay in ms.
   *
   * @default 600
   */
  scrollHideDelay?: number;
  /**
   * Fixed height of the root. Numbers are treated as pixels.
   *
   * @default undefined
   */
  height?: string | number;
};
