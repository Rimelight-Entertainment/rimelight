export interface AvatarProps {
  /**
   * The source URL of the avatar image.
   */
  src?: string
  /**
   * Alt description for screen readers.
   */
  alt?: string
  /**
   * Two-letter fallback initials when src fails to load.
   */
  fallback?: string
  /**
   * The avatar dimensions scale.
   */
  size?: "sm" | "md" | "lg"
  /**
   * Displays a status badge circle on the avatar.
   */
  badge?: boolean
  /**
   * The color of the status badge.
   */
  badgeColor?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
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