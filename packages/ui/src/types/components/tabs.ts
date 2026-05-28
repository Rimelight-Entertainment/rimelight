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
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info" | "neutral" | "commentary" | "ideation" | "source" | (string & {})
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
