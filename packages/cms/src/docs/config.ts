import type { SidebarItem, SidebarScope } from "@rimelight/ui/components/sidebar/sidebar.ts"
import type { BadgeProps } from "@rimelight/ui/components/badge/badge.ts"

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
export type { BadgeProps, SidebarItem, SidebarScope }
