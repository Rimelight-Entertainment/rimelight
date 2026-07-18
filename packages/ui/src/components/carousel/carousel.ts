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
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any
  [key: string]: unknown
}
