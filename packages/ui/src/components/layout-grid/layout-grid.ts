export interface LayoutGridProps {
  /**
   * Number of columns on base/xs viewports (<640px by default).
   *
   * @default 4
   */
  cols?: number
  /**
   * Number of columns on sm viewports (>=640px by default).
   *
   * @default 4
   */
  smCols?: number
  /**
   * Number of columns on md viewports (>=768px by default).
   *
   * @default 8
   */
  mdCols?: number
  /**
   * Number of columns on lg viewports (>=1024px by default).
   *
   * @default 12
   */
  lgCols?: number
  /**
   * Number of columns on xl viewports (>=1280px by default).
   *
   * @default 12
   */
  xlCols?: number
  /**
   * Breakpoint width in pixels for sm breakpoint.
   *
   * @default 640
   */
  smBreakpoint?: number
  /**
   * Breakpoint width in pixels for md breakpoint.
   *
   * @default 768
   */
  mdBreakpoint?: number
  /**
   * Breakpoint width in pixels for lg breakpoint.
   *
   * @default 1024
   */
  lgBreakpoint?: number
  /**
   * Breakpoint width in pixels for xl breakpoint.
   *
   * @default 1280
   */
  xlBreakpoint?: number
  /**
   * Spacing between columns in rem. Can be a single number or array [base, sm, md, lg, xl].
   *
   * @default 1
   */
  gutter?: number | number[]
  /**
   * Spacing on outer margins of the grid in rem. Can be a single number or array [base, sm, md, lg,
   * xl].
   *
   * @default 1
   */
  margin?: number | number[]
  /**
   * Color value (CSS color string) for the grid.
   *
   * @default "#ff0000"
   */
  gridColor?: string
  /**
   * Opacity for filled column backgrounds.
   *
   * @default 0.1
   */
  gridOpacity?: number
  /**
   * Maximum width of the grid container (CSS max-width string).
   *
   * @default "100vw"
   */
  maxWidth?: string
  /**
   * Whether to display colored backgrounds in columns.
   *
   * @default false
   */
  showBackground?: boolean
  /**
   * Whether to overlay a secondary full-width viewport grid.
   *
   * @default true
   */
  showFullWidth?: boolean
  /**
   * Color value (CSS color string) for the full-width grid overlay.
   *
   * @default "#3b82f6"
   */
  fullWidthGridColor?: string
  /**
   * Opacity for filled full-width column backgrounds.
   *
   * @default 0.05
   */
  fullWidthGridOpacity?: number
  /**
   * Whether to display colored backgrounds in full-width columns.
   *
   * @default false
   */
  showFullWidthBackground?: boolean
  /**
   * Z-index of the grid overlay.
   *
   * @default 1000
   */
  zIndex?: number
  /**
   * Shortcut key combination to toggle grid visibility, using underscore formatting (e.g.
   * meta_shift_g).
   *
   * @default "meta_shift_g"
   */
  shortcut?: string
  /**
   * Whether the grid is restricted only to development mode (import.meta.env.DEV).
   *
   * @default true
   */
  devOnly?: boolean
  /**
   * Maximum width of the inner content container (CSS max-width string).
   *
   * @default "768px"
   */
  innerMaxWidth?: string
  /**
   * Color value for inner grid.
   *
   * @default "#10b981"
   */
  innerGridColor?: string
  /**
   * Opacity for inner grid background.
   *
   * @default 0.1
   */
  innerGridOpacity?: number
  /**
   * Whether to display background for inner grid.
   *
   * @default true
   */
  showInnerBackground?: boolean
  /**
   * UI class overrides for components elements slots.
   */
  ui?: any
  /**
   * CSS class to apply to the root wrapper.
   */
  class?: any
  [key: string]: any
}
