export interface ComboboxProps {
  /**
   * The list of items in the combobox.
   */
  items?: Array<{ label: string; value: string; [key: string]: any } | string>
  /**
   * Selected value(s).
   */
  value?: string | string[]
  /**
   * Placeholder text.
   */
  placeholder?: string
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
