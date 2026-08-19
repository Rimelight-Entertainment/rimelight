import type { BadgeProps } from "../badge/badge"

export interface SidebarItem {
  label: string
  href?: string
  icon?: string
  badge?: string | BadgeProps
  active?: boolean
  children?: SidebarItem[]
  items?: SidebarItem[]
  collapsed?: boolean
}

export interface SidebarScope {
  id?: string
  label: string
  href?: string
  icon?: string
  items?: SidebarItem[]
  collapsed?: boolean
}

export interface SidebarProps {
  t?: (key: string) => string
  _depth?: number
  /**
   * The navigation links array.
   */
  items?: SidebarItem[]
  /**
   * Side of the page.
   */
  side?: "left" | "right"
  /**
   * Collapsible mode.
   */
  collapsible?: "icon" | "offcanvas" | "none"
  /**
   * The visual style variant of the sidebar.
   */
  variant?: "sidebar" | "floating" | "inset"
  /**
   * Header logo or text.
   */
  logo?: string
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
