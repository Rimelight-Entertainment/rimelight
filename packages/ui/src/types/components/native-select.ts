export interface NativeSelectProps {
  /**
   * List of options.
   */
  items?: Array<{ label: string; value: string; [key: string]: any } | string>
  /**
   * Selected value.
   */
  value?: string
  /**
   * Disabled state.
   */
  disabled?: boolean
  /**
   * Form control name.
   */
  name?: string
  /**
   * Form label.
   */
  label?: string
  /**
   * Size scale.
   */
  size?: "sm" | "md" | "lg"
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
