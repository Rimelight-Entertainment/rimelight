import type { ThemeColor } from "../../config"
export interface TextareaProps {
  /**
   * The text value.
   */
  value?: string
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
   * Row count.
   */
  rows?: number
  /**
   * Error state.
   */
  error?: boolean | string
  /**
   * Size scale.
   */
  size?: "sm" | "md" | "lg"
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
  [key: string]: unknown
}
