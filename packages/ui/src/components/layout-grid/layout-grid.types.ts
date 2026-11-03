import type { InferThemeProps } from "../../resolver";
import type { RLLayoutGridTheme } from "./layout-grid.theme";

export type RLLayoutGridProps = InferThemeProps<typeof RLLayoutGridTheme> & {
  /**
   * Number of columns at the base breakpoint.
   *
   * @default 4
   */
  cols?: number;
  /**
   * Number of columns at the sm breakpoint.
   *
   * @default 4
   */
  smCols?: number;
  /**
   * Number of columns at the md breakpoint.
   *
   * @default 4
   */
  mdCols?: number;
  /**
   * Number of columns at the lg breakpoint.
   *
   * @default 4
   */
  lgCols?: number;
  /**
   * Number of columns at the xl breakpoint.
   *
   * @default 4
   */
  xlCols?: number;
  smBreakpoint?: number;
  mdBreakpoint?: number;
  lgBreakpoint?: number;
  xlBreakpoint?: number;
  gutter?: number | number[];
  margin?: number | number[];
  gridColor?: string;
  gridOpacity?: number;
  maxWidth?: string;
  innerMaxWidth?: string;
  innerGridColor?: string;
  innerGridOpacity?: number;
  showInnerBackground?: boolean;
  showBackground?: boolean;
  showFullWidth?: boolean;
  fullWidthGridColor?: string;
  fullWidthGridOpacity?: number;
  showFullWidthBackground?: boolean;
  zIndex?: number;
  shortcut?: string;
  devOnly?: boolean;
};
