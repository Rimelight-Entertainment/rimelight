export interface AvatarItemData {
  /**
   * Image URL.
   */
  src?: string
  /**
   * Alt text for the image.
   */
  alt?: string
  /**
   * Fallback text (initials or short label).
   */
  fallback?: string
  /**
   * Alias for fallback — two-letter initials.
   */
  initials?: string
  /**
   * Color variant passed to the inner Avatar.
   */
  color?: string
}

export interface AvatarGroupProps {
  /**
   * Array of avatar data to render automatically. When provided, enables the CSS responsive item
   * counter. When omitted, falls back to the default `<slot />` behaviour.
   */
  items?: AvatarItemData[]
  /**
   * Maximum number of avatars to show at full container width. Additional avatars are pre-hidden
   * server-side and counted. Container queries will responsively hide more as width shrinks.
   *
   * @default 5
   */
  displayLimit?: number
  /**
   * Avatar size — forwarded to each inner RLAAvatar.
   *
   * @default "md"
   */
  size?: "3xs" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"
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
