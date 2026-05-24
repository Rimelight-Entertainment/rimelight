export interface SidebarItem {
  label: string
  href?: string
  icon?: string
  badge?: string | number
  active?: boolean
  children?: SidebarItem[]
}

export interface SidebarProps {
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

