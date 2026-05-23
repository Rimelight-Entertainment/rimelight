export interface StickySurfaceProps {
  /**
   * Pixels offset from top when sticky.
   */
  offsetTop?: number
  /**
   * Z-index layer depth.
   */
  zIndex?: number
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
