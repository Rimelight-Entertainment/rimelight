import type { SidebarItem, SidebarScope } from "@rimelight/ui/components/sidebar/sidebar.types.ts";
import type { RLBadgeProps } from "@rimelight/ui/components/badge/badge.types.ts";

export interface EditLinkConfig {
  baseUrl: string;
}

export interface TableOfContentsConfig {
  minHeadingLevel?: number;
  maxHeadingLevel?: number;
}

export interface DocsConfig {
  basePath?: string;
  sidebar:
    | (SidebarItem | SidebarScope)[]
    | {
        scopes: SidebarScope[];
      };
  editLink?: EditLinkConfig;
  tableOfContents?: false | TableOfContentsConfig;
}

export const defineDocsConfig = <const T extends DocsConfig>(config: T): T => config;
export type { RLBadgeProps, SidebarItem, SidebarScope };
