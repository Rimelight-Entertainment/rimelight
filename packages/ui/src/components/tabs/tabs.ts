import type { ThemeColor } from "../../types/component"

export interface TabItem {
  label?: string
  value?: string
  icon?: string
  badge?: string | number | { label?: string | number; color?: string; variant?: string }
  content?: string
  disabled?: boolean
  slot?: string
  class?: any
  ui?: any
  [key: string]: any
}

export interface TabsProps<T extends TabItem = TabItem> {
  /**
   * The tab items.
   */
  items?: T[]
  /**
   * Active tab value.
   */
  value?: string
  /**
   * Default active tab value when uncontrolled.
   */
  defaultValue?: string
  /**
   * Tab variant.
   * @defaultValue 'pill'
   */
  variant?: "pill" | "underline" | "link" | "solid" | "pills"
  /**
   * Layout orientation.
   * @defaultValue 'horizontal'
   */
  orientation?: "horizontal" | "vertical"
  /**
   * Size scale.
   * @defaultValue 'md'
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  /**
   * Color theme.
   */
  color?: ThemeColor
  /**
   * Whether to render content panels automatically. Set to false for tab bar only.
   * @defaultValue true
   */
  content?: boolean
  /**
   * Unmount hidden tab panels from DOM. Defaults to true.
   * If false, panel is hidden via CSS/attribute.
   * @defaultValue true
   */
  unmountOnHide?: boolean
  /**
   * Property key for value on item object.
   * @defaultValue 'value'
   */
  valueKey?: string
  /**
   * Property key for label on item object.
   * @defaultValue 'label'
   */
  labelKey?: string
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

