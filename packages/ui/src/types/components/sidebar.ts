export interface BadgeConfig {
  text: string
  color?: string
  variant?:
    | "solid"
    | "outline"
    | "soft"
    | "note"
    | "tip"
    | "caution"
    | "danger"
    | "success"
    | "default"
  class?: string
}

export interface SidebarItem {
  label: string
  href?: string
  icon?: string
  badge?: string | BadgeConfig
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

export interface TableOfContentsConfig {
  minHeadingLevel?: number
  maxHeadingLevel?: number
}

export interface EditLinkConfig {
  baseUrl: string
}

export interface DocsConfig {
  basePath?: string
  sidebar:
    | (SidebarItem | SidebarScope)[]
    | {
        scopes: SidebarScope[]
      }
  editLink?: EditLinkConfig
  tableOfContents?: false | TableOfContentsConfig
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
