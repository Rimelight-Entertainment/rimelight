import type { InferThemeProps } from "../../resolver";
import type { RLGridTheme } from "./grid.theme";

export type RLGridProps = Omit<InferThemeProps<typeof RLGridTheme>, "cols"> & {
  /**
   * Number of columns at the largest breakpoint.
   *
   * @default 2
   */
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
};
