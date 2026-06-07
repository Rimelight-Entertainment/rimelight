import type { ThemeColor } from "../theme"
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
  color?: ThemeColor
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any
  /**
   * Whether the toast can be dismissed by user or timeout.
   */
  dismissable?: boolean
  [key: string]: unknown
}
