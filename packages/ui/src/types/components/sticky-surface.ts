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
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any
  [key: string]: unknown
}
