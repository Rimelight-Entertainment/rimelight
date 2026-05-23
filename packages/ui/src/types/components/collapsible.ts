export interface CollapsibleProps {
  /**
   * Controlled open state.
   */
  open?: boolean
  /**
   * The trigger button label (or use 'trigger' slot)
   */
  label?: string
  /**
   * An optional leading icon for the trigger button
   */
  icon?: string
  /**
   * Size scale of the trigger.
   */
  size?: "sm" | "md" | "lg"
  /**
   * Color theme of the trigger.
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
