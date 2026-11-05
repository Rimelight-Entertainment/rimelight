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
   * @default 8
   */
  mdCols?: number;
  /**
   * Number of columns at the lg breakpoint.
   *
   * @default 12
   */
  lgCols?: number;
  /**
   * Number of columns at the xl breakpoint.
   *
   * @default 12
   */
  xlCols?: number;
  /**
   * Minimum viewport width in pixels for the sm breakpoint.
   *
   * @default 640
   */
  smBreakpoint?: number;
  /**
   * Minimum viewport width in pixels for the md breakpoint.
   *
   * @default 768
   */
  mdBreakpoint?: number;
  /**
   * Minimum viewport width in pixels for the lg breakpoint.
   *
   * @default 1024
   */
  lgBreakpoint?: number;
  /**
   * Minimum viewport width in pixels for the xl breakpoint.
   *
   * @default 1280
   */
  xlBreakpoint?: number;
  /**
   * Gutter between columns in rem, one value per breakpoint or a single value for all.
   *
   * @default [0.75, 1, 1.5, 2, 2]
   */
  gutter?: number | number[];
  /**
   * Outer margin in rem, one value per breakpoint or a single value for all.
   *
   * @default [0.75, 1, 1.5, 2, 2]
   */
  margin?: number | number[];
  /**
   * Color of the main column guides.
   *
   * @default "var(--rl-error-500)"
   */
  gridColor?: string;
  /**
   * Opacity of the main column guide background.
   *
   * @default 0.1
   */
  gridOpacity?: number;
  /**
   * Maximum width of the main container in px, or a value containing `vw`.
   *
   * @default "1440px"
   */
  maxWidth?: string;
  /**
   * Maximum width of the inner (content) region in px, or a value containing `vw`.
   *
   * @default "768px"
   */
  innerMaxWidth?: string;
  /**
   * Color of the columns that fall inside the inner region.
   *
   * @default "var(--rl-success-500)"
   */
  innerGridColor?: string;
  /**
   * Opacity of the inner column background.
   *
   * @default 0.1
   */
  innerGridOpacity?: number;
  /**
   * Whether the inner column background is painted.
   *
   * @default true
   */
  showInnerBackground?: boolean;
  /**
   * Whether the main column background is painted.
   *
   * @default true
   */
  showBackground?: boolean;
  /**
   * Whether full-width columns are drawn outside the main container.
   *
   * @default true
   */
  showFullWidth?: boolean;
  /**
   * Color of the full-width columns drawn outside the main container.
   *
   * @default "var(--rl-info-500)"
   */
  fullWidthGridColor?: string;
  /**
   * Opacity of the full-width column background.
   *
   * @default 0.05
   */
  fullWidthGridOpacity?: number;
  /**
   * Whether the full-width column background is painted.
   *
   * @default true
   */
  showFullWidthBackground?: boolean;
  /**
   * Stacking order of the overlay.
   *
   * @default 1000
   */
  zIndex?: number;
  /**
   * Keyboard shortcut that toggles the overlay.
   *
   * @default "meta_shift_g"
   */
  shortcut?: string;
  /**
   * Render only in development builds.
   *
   * @default true
   */
  devOnly?: boolean;
};

export type GridBreakpoint = "base" | "sm" | "md" | "lg" | "xl";

export interface GridLine {
  color: string;
  opacity: number;
  background: boolean;
}

export type GridColumnStyle = Record<`--rl-${string}`, string>;

export interface GridMetricsInput {
  width: number;
  fontSize: number;
  /** Minimum viewport width per breakpoint, indexed base..xl. */
  thresholds: readonly number[];
  /** Column count per breakpoint, indexed base..xl. */
  columns: readonly number[];
  /** Gutter in rem per breakpoint, indexed base..xl. */
  gutter: readonly number[];
  /** Margin in rem per breakpoint, indexed base..xl. */
  margin: readonly number[];
  maxWidth: string;
  innerMaxWidth: string;
  grid: GridLine;
  inner: GridLine;
  fullWidth: GridLine;
  showFullWidth: boolean;
}

export interface GridMetrics {
  breakpoint: GridBreakpoint;
  threshold: number;
  width: number;
  colCount: number;
  gutterPx: number;
  marginPx: number;
  colWidth: number;
  maxWidth: string;
  totalCols: number;
  innerColumns: GridColumnStyle[];
  outerColumns: GridColumnStyle[];
}
