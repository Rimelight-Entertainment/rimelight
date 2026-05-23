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
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  /**
   * UI class override map.
   */
  ui?: any
  /**
   * Root CSS class override.
   */
  class?: any
  [key: string]: unknown
}
