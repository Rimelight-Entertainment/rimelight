import type { Theme, ThemeColor } from "../../types"
import type { LinkProps } from "../link/link"

export interface ButtonProps extends LinkProps {
  /**
   * The visual style variant of the button
   */
  variant?: "solid" | "outline" | "soft" | "subtle" | "ghost" | "link" | undefined
  /**
   * The color scheme applied to the button
   */
  color?: ThemeColor | undefined
  /**
   * The size scale of the button
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | undefined
  /**
   * When provided, renders the button as an anchor link
   */
  href?: string | undefined
  /**
   * The text label displayed inside the button
   */
  label?: string | undefined
  /**
   * Icon name displayed before the label
   */
  leadingIcon?: string | undefined
  /**
   * Icon name displayed after the label
   */
  trailingIcon?: string | undefined
  /**
   * Shows a loading spinner animation
   */
  loading?: boolean | undefined
  /**
   * Automatically toggles loading state when an async onClick handler is executed
   */
  loadingAuto?: boolean | undefined
  /**
   * Renders a square button with equal padding
   */
  square?: boolean | undefined
  /**
   * Makes the button stretch to full width
   */
  block?: boolean | undefined
  /**
   * Horizontal alignment of content inside the button flex container
   */
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly" | undefined
  /**
   * Applies active state styling
   */
  active?: boolean | undefined
  /**
   * Color used when button is in active state
   */
  activeColor?: ThemeColor | undefined
  /**
   * Variant used when button is in active state
   */
  activeVariant?: "solid" | "outline" | "soft" | "subtle" | "ghost" | "link" | undefined
  /**
   * Theme mode override — pins colors to flat, light, or dark mode.
   */
  theme?: Theme | undefined
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
