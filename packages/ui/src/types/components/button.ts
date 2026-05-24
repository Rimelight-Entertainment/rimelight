export interface ButtonProps {
  /**
   * The visual style variant of the button
   */
  variant?: "solid" | "outline" | "ghost" | "link" | "soft"
  /**
   * The color scheme applied to the button
   */
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "white" | "black"
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
  activeColor?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "white"
    | "black"
  /**
   * Variant used when button is in active state
   */
  activeVariant?: "solid" | "outline" | "ghost" | "link" | "soft"
  /**
   * Theme mode override — pins colors to flat, light, or dark mode.
   */
  theme?: "flat" | "light" | "dark"
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
