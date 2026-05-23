export interface CarouselSlide {
  imageSrc?: string
  title?: string
  description?: string
}

export interface CarouselProps {
  /**
   * The list of slide items to render.
   */
  slides?: CarouselSlide[]
  /**
   * Controlled autoplay.
   */
  autoplay?: boolean
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
