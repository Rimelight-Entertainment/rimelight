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
   * UI class override map.
   */
  ui?: any
  /**
   * Root CSS class override.
   */
  class?: any
  [key: string]: unknown
}
