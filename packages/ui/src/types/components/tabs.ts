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
