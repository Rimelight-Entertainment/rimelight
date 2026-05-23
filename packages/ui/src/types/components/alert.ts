export interface AlertProps {
  /**
   * The visual variant of the alert.
   */
  variant?: "default" | "destructive" | "outline" | "solid"
  /**
   * The color scheme of the alert.
   */
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  /**
   * The main title text of the alert.
   */
  title?: string
  /**
   * The secondary description text of the alert.
   */
  description?: string
  /**
   * An optional leading icon.
   */
  icon?: string
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Additional CSS classes to apply to the root component.
   */
  class?: any
  [key: string]: unknown
}
