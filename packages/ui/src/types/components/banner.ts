export interface BannerAction {
  label: string
  href?: string
  variant?: string
  color?: string
  size?: string
  class?: string
  [key: string]: unknown
}

export interface BannerProps {
  /**
   * Whether to contain the banner content within a max-width container.
   */
  contain?: boolean
  /**
   * Whether the banner should be sticky at the top of the viewport.
   */
  sticky?: boolean
  /**
   * Whether the banner should be fixed at the top of the viewport.
   */
  fixed?: boolean
  /**
   * The z-index stack position of the banner.
   */
  stackIndex?: number
  /**
   * Whether to hide the banner when scrolling down and show it when scrolling up.
   */
  hideOnScroll?: boolean
  /**
   * Whether the banner can be closed by the user. Closes permanently via localStorage.
   */
  dismissable?: boolean
  /**
   * Key used for localStorage dismissal persistence. Defaults to auto-generated id.
   */
  dismissId?: string
  /**
   * List of action buttons to render in the banner.
   */
  actions?: BannerAction[]
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
