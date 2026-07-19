import type { ThemeColor } from "../../types/component"
export interface TabItem {
  label: string
  value: string
  icon?: string
  content?: string
  disabled?: boolean
}

export interface TabsProps {
  /**
   * The tab items.
   */
  items?: TabItem[]
  /**
   * Active tab value.
   */
  value?: string
  /**
   * Tab variant.
   */
  variant?: "solid" | "underline" | "pills"
  /**
   * Layout orientation.
   */
  orientation?: "horizontal" | "vertical"
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
