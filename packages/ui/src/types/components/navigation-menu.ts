export interface NavigationMenuItem {
  label: string
  href?: string
  icon?: string
  description?: string
  children?: NavigationMenuItem[]
}

export interface NavigationMenuProps {
  /**
   * Main menu navigation links.
   */
  items?: NavigationMenuItem[]
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
