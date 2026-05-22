import type { LinkProps } from "./link"

export interface NavigationMenuItem extends Omit<LinkProps, "class"> {
  label?: string
  icon?: string
  badge?: string | number | any
  avatar?: any
  chip?: boolean | any
  tooltip?: boolean | any
  popover?: boolean | any
  trailingIcon?: string
  type?: "label" | "trigger" | "link"
  slot?: string
  value?: string
  children?: NavigationMenuChildItem[]
  defaultOpen?: boolean
  open?: boolean
  onSelect?: (e: Event) => void
  click?: (event: MouseEvent) => void
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Additional CSS classes to apply to the root component.
   */
  class?: any
  [key: string]: unknown
}

export interface NavigationMenuChildItem extends Omit<NavigationMenuItem, "type" | "ui"> {
  description?: string
  [key: string]: any
}
