import type { Theme, ThemeColor } from "../../types"

export interface SwitchProps {
  /**
   * Controlled checked state.
   */
  checked?: boolean
  /**
   * Disabled state.
   */
  disabled?: boolean
  /**
   * Input element name.
   */
  name?: string
  /**
   * Label descriptor.
   */
  label?: string
  /**
   * Size scale.
   */
  size?: "sm" | "md" | "lg"
  /**
   * Color theme.
   */
  color?: ThemeColor
  /**
   * Theme mode override â€” pins colors to flat, light, or dark mode.
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
