import type { Theme, ThemeColor } from "../../themes/theme"
import type { LinkProps } from "./link"

export interface ButtonProps extends LinkProps {
  /**
   * The visual style variant of the button
   */
  variant?: "solid" | "outline" | "soft" | "subtle" | "ghost" | "link"
  /**
   * The color scheme applied to the button
   */
  color?: ThemeColor
  /**
   * The size scale of the button
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  /**
   * When provided, renders the button as an anchor link
   */
  href?: string
  /**
   * The text label displayed inside the button
   */
  label?: string
  /**
   * Icon name displayed before the label
   */
  leadingIcon?: string
  /**
   * Icon name displayed after the label
   */
  trailingIcon?: string
  /**
   * Shows a loading spinner animation
   */
  loading?: boolean
  /**
   * Automatically toggles loading state when an async onClick handler is executed
   */
  loadingAuto?: boolean
  /**
   * Renders a square button with equal padding
   */
  square?: boolean
  /**
   * Makes the button stretch to full width
   */
  block?: boolean
  /**
   * Applies active state styling
   */
  active?: boolean
  /**
   * Color used when button is in active state
   */
  activeColor?: ThemeColor
  /**
   * Variant used when button is in active state
   */
  activeVariant?: "solid" | "outline" | "soft" | "subtle" | "ghost" | "link"
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
