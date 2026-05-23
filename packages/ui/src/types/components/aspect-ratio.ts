export interface AspectRatioProps {
  /**
   * The aspect ratio fraction/decimal (e.g. 16/9, 4/3, 1).
   */
  ratio?: number
  /**
   * UI class override map.
   */
  ui?: any
  /**
   * Root CSS class overrides.
   */
  class?: any
  [key: string]: unknown
}
