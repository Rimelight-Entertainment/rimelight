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
   * UI class override map.
   */
  ui?: any
  /**
   * Root CSS class override.
   */
  class?: any
  [key: string]: unknown
}
