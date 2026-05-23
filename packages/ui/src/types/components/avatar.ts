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
   * UI style slot mapping overrides.
   */
  ui?: any
  /**
   * Custom CSS root class.
   */
  class?: any
  [key: string]: unknown
}

export interface AvatarGroupProps {
  /**
   * UI class overrides.
   */
  ui?: any
  /**
   * Root CSS class override.
   */
  class?: any
  [key: string]: unknown
}
