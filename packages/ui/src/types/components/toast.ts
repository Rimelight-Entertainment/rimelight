export interface ToastProps {
  /**
   * Main toast title.
   */
  title?: string
  /**
   * Description or message.
   */
  description?: string
  /**
   * Visual variant.
   */
  variant?: "default" | "destructive" | "success" | "warning" | "info"
  /**
   * Action button label.
   */
  actionLabel?: string
  /**
   * Duration in ms.
   */
  duration?: number
  /**
   * Color theme.
   */
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
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
