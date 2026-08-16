import type { ThemeColor } from "../../index"

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
   *
   * @default "pill"
   */
  variant?: "pill" | "underline" | "link" | "solid" | "pills"
  /**
   * Layout orientation.
   *
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical"
  /**
   * Size scale.
   *
   * @default "md"
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  /**
   * Color theme.
   */
  color?: ThemeColor
  /**
   * Whether to render content panels automatically. Set to false for tab bar only.
   *
   * @default true
   */
  content?: boolean
  /**
   * Unmount hidden tab panels from DOM. Defaults to true. If false, panel is hidden via
   * CSS/attribute.
   *
   * @default true
   */
  unmountOnHide?: boolean
  /**
   * Property key for value on item object.
   *
   * @default "value"
   */
  valueKey?: string
  /**
   * Property key for label on item object.
   *
   * @default "label"
   */
  labelKey?: string
  /**
   * Maximum number of tab triggers to render in the tab list. Tabs beyond this cap are placed in a
   * native popover accessible via a '+N more' overflow button at the end of the tab list.
   *
   * Additionally, container queries will progressively hide visible triggers from right to left as
   * the container narrows, surfacing those in the popover as well.
   *
   * When undefined, all tabs are rendered in the list (original behaviour).
   */
  maxTabs?: number
  /**
   * Estimated width in pixels of each tab trigger — used to compute the container-query breakpoints
   * that drive the responsive overflow. Increase for longer labels, decrease for icon-only tabs.
   *
   * @default 100
   */
  estimatedTabWidth?: number
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
