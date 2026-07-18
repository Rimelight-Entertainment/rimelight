import type { ThemeColor } from "../../themes/theme"
export interface ChartDataPoint {
  label: string
  value: number
  color?: string
  [key: string]: any
}

export interface ChartProps {
  /**
   * Type of chart.
   */
  type?: "bar" | "line" | "pie" | "area" | "donut"
  /**
   * Data points array.
   */
  data?: ChartDataPoint[]
  /**
   * Title of the chart.
   */
  title?: string
  /**
   * Height of the chart in pixels.
   */
  height?: number
  /**
   * Color theme.
   */
  color?: ThemeColor
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any
  [key: string]: unknown
}
