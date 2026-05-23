export interface KbdProps {
  /**
   * The size scale of the keyboard key component.
   */
  size?: "sm" | "md" | "lg"
  /**
   * Custom UI overrides.
   */
  ui?: any
  /**
   * Root CSS class overrides.
   */
  class?: any
  [key: string]: unknown
}
