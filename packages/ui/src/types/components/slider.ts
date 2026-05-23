export interface SliderProps {
  /**
   * The value of the range input.
   */
  value?: number
  /**
   * Minimum boundary.
   */
  min?: number
  /**
   * Maximum boundary.
   */
  max?: number
  /**
   * Steps size.
   */
  step?: number
  /**
   * Form element input name.
   */
  name?: string
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
