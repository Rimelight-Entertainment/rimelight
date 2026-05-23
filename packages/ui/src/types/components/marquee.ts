export interface MarqueeProps {
  /**
   * Direction of marquee motion.
   */
  direction?: "left" | "right" | "up" | "down"
  /**
   * Speed of animation in seconds (duration of scroll cycle).
   */
  speed?: number
  /**
   * Whether to pause scroll animation on mouse hover.
   */
  pauseOnHover?: boolean
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
