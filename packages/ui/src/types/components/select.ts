export interface SelectProps {
  /**
   * List of options.
   */
  items?: Array<{ label: string; value: string; [key: string]: any } | string>
  /**
   * Selected value.
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
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any
  [key: string]: unknown
}
