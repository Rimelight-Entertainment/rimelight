import type { Theme } from "../theme"

export interface InputProps {
  /**
   * Type of input element.
   */
  type?: "text" | "password" | "email" | "number" | "date" | "search" | "tel" | "url"
  /**
   * The input value.
   */
  value?: string | number
  /**
   * Placeholder text.
   */
  placeholder?: string
  /**
   * Disabled state.
   */
  disabled?: boolean
  /**
   * Readonly state.
   */
  readonly?: boolean
  /**
   * Name for forms.
   */
  name?: string
  /**
   * Required field state.
   */
  required?: boolean
  /**
   * Error state.
   */
  error?: boolean | string
  /**
   * Leading icon name.
   */
  leadingIcon?: string
  /**
   * Trailing icon name.
   */
  trailingIcon?: string
  /**
   * Size scale.
   */
  size?: "sm" | "md" | "lg"
  /**
   * Color theme.
   */
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "neutral" | "commentary" | "ideation" | "source" | (string & {})
  /**
   * Theme mode override — pins colors to flat, light, or dark mode.
   */
  theme?: Theme
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
