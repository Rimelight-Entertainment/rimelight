import type { InferThemeProps } from "../../resolver";
import type { RLScrollAreaTheme } from "./scroll-area.theme";

export type RLScrollAreaProps = Omit<InferThemeProps<typeof RLScrollAreaTheme>, "orientation"> & {
  /**
   * Orientation of the scrollbar.
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
   * Height override if needed.
   *
   * @default undefined
   */
  height?: string | number;
};
