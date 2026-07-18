import type { BadgeConfig, SidebarItem, SidebarScope } from "@rimelight/ui/config"

export interface EditLinkConfig {
  baseUrl: string
}

export interface TableOfContentsConfig {
  minHeadingLevel?: number
  maxHeadingLevel?: number
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

export const defineDocsConfig = <const T extends DocsConfig>(config: T): T => config
export type { BadgeConfig, SidebarItem, SidebarScope }
