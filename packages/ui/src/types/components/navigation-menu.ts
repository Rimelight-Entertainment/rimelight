import type { ThemeColor } from "../theme"
import type { LinkProps } from "./link"

export interface NavigationMenuItem extends Omit<LinkProps, "type" | "raw" | "custom"> {
  label?: string
  icon?: string
  badge?: string | number
  avatar?: Record<string, any>
  chip?: boolean | Record<string, any>
  tooltip?: boolean | string | Record<string, any>
  popover?: boolean | Record<string, any>
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
   * Additional CSS classes to apply to the root element.
   */
  class?: any
  [key: string]: unknown
}

export interface NavigationMenuChildItem extends Omit<NavigationMenuItem, "type" | "ui"> {
  description?: string
  [key: string]: any
}

export interface NavigationMenuProps {
  /**
   * Main menu navigation links.
   */
  items?: NavigationMenuItem[]
  /**
   * Color theme.
   */
  color?: ThemeColor
  /**
   * Orientation of the menu.
   */
  orientation?: "horizontal" | "vertical"
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
