export interface TimelineItem {
  date?: string
  title?: string
  description?: string
  icon?: string
  avatar?: any
  value?: string | number
  slot?: string
  class?: any
  ui?: {
    item?: any
    container?: any
    indicator?: any
    separator?: any
    wrapper?: any
    date?: any
    title?: any
    description?: any
    [key: string]: any
  }
  [key: string]: any
}

export interface TimelineItemProps extends TimelineItem {
  as?: any
  isLast?: boolean
  state?: "active" | "completed"
  size?: "3xs" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"
  color?: "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral"
  orientation?: "horizontal" | "vertical"
  class?: any
}

export interface TimelineProps<T extends TimelineItem = TimelineItem> {
  /**
   * The element or component this component should render as.
   */
  as?: any
  items?: T[]
  size?: "3xs" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"
  color?: "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral"
  /**
   * The orientation of the Timeline.
   *
   * @default "vertical"
   */
  orientation?: "horizontal" | "vertical"
  /**
   * The key used to get the value from the item.
   *
   * @default "value"
   */
  valueKey?: string
  defaultValue?: string | number
  modelValue?: string | number
  reverse?: boolean
  ui?: {
    root?: any
    item?: any
    container?: any
    indicator?: any
    separator?: any
    wrapper?: any
    date?: any
    title?: any
    description?: any
    [key: string]: any
  }
  class?: any
  [key: string]: unknown
}
