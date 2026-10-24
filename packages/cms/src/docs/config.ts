import type { SidebarItem, SidebarScope } from "@rimelight/ui/components/sidebar/sidebar.types.ts";
import type { Cms } from "../services/index";
import type { RLBadgeProps } from "@rimelight/ui/components/badge/badge.types.ts";

export interface EditLinkConfig {
  baseUrl: string;
}

export interface TableOfContentsConfig {
  minHeadingLevel?: number;
  maxHeadingLevel?: number;
}

export interface DocsConfig {
  basePath?: string | undefined;
  sidebar:
    | (SidebarItem | SidebarScope)[]
    | {
        scopes: SidebarScope[];
      };
  editLink?: EditLinkConfig | undefined;
  tableOfContents?: false | TableOfContentsConfig | undefined;
}

export const defineDocsConfig = <const T extends DocsConfig>(config: T): T => config;
export type { RLBadgeProps, SidebarItem, SidebarScope };

export interface DocsNavOptions {
  basePath?: string | undefined;
  defaultScope?: string | undefined;
  editBaseUrl?: string | undefined;
  tableOfContents?: false | TableOfContentsConfig | undefined;
  locale?: string | undefined;
}

function titleCase(str: string): string {
  return str
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getLocalizedText(val: any, locale = "en"): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    return val[locale] || val.en || Object.values(val)[0] || "";
  }
  return String(val);
}

export const defaultDocsConfig: DocsConfig = {
  sidebar: {
    scopes: [],
  },
  tableOfContents: {
    minHeadingLevel: 2,
    maxHeadingLevel: 3,
  },
};

export function buildDocsNavFromPages(pages: any[], options: DocsNavOptions = {}): DocsConfig {
  const locale = options.locale || "en";
  const basePath = options.basePath || "/{locale}/docs";

  if (!pages || pages.length === 0) {
    return {
      basePath,
      sidebar: { scopes: [] },
      editLink: options.editBaseUrl ? { baseUrl: options.editBaseUrl } : undefined,
      tableOfContents: options.tableOfContents ?? { minHeadingLevel: 2, maxHeadingLevel: 3 },
    };
  }

  const standardScopeIcons: Record<string, string> = {
    overview: "i-lucide-book-open",
    features: "i-lucide-layers",
    components: "i-lucide-blocks",
    foundation: "i-lucide-layout",
    company: "i-lucide-building-2",
    guides: "i-lucide-compass",
    api: "i-lucide-code-2",
    website: "i-lucide-globe",
    branding: "i-lucide-palette",
  };

  const scopeMap = new Map<
    string,
    {
      id: string;
      label: string;
      icon?: string;
      order?: number;
      items: SidebarItem[];
    }
  >();

  for (const page of pages) {
    const props = page.properties ?? {};
    const rawSlug = String(page.slug || "").replace(/^\/+|\/+$/g, "");

    const segments = rawSlug.split("/").filter(Boolean);
    const scopeId = (
      props.scope ||
      props.section ||
      (segments.length > 1 ? segments[0] : options.defaultScope || "overview")
    ).toLowerCase();
    const scopeLabel = props.scopeLabel || titleCase(scopeId);
    const scopeIcon = props.scopeIcon || standardScopeIcons[scopeId] || "i-lucide-folder";
    const scopeOrder = typeof props.scopeOrder === "number" ? props.scopeOrder : undefined;

    if (!scopeMap.has(scopeId)) {
      scopeMap.set(scopeId, {
        id: scopeId,
        label: scopeLabel,
        icon: scopeIcon,
        order: scopeOrder,
        items: [],
      });
    }

    const scopeObj = scopeMap.get(scopeId)!;
    const title =
      getLocalizedText(page.title, locale) ||
      titleCase(segments[segments.length - 1] || "Untitled");
    const href = rawSlug.startsWith("http")
      ? rawSlug
      : rawSlug.startsWith("{locale}") ||
          rawSlug.startsWith("/company/docs") ||
          rawSlug.startsWith("/docs")
        ? rawSlug.startsWith("/")
          ? rawSlug
          : `/${rawSlug}`
        : `${basePath}/${rawSlug}`;

    const item: SidebarItem = {
      label: title,
      href,
      icon: props.icon,
      badge: props.badge,
      collapsed: props.collapsed,
    };

    if (segments.length > 2) {
      const subGroup = segments[1]!;
      let groupItem = scopeObj.items.find(
        (i: any) => i.label?.toLowerCase() === subGroup.toLowerCase() || (i as any).id === subGroup,
      );
      if (!groupItem) {
        groupItem = {
          label: titleCase(subGroup),
          collapsed: true,
          items: [],
        };
        scopeObj.items.push(groupItem);
      }
      if (!groupItem.items) groupItem.items = [];
      groupItem.items.push(item);
    } else {
      scopeObj.items.push(item);
    }
  }

  const sortedScopes: SidebarScope[] = Array.from(scopeMap.values()).map((s) => ({
    id: s.id,
    label: s.label,
    icon: s.icon,
    items: s.items,
  }));

  return {
    basePath,
    sidebar: {
      scopes: sortedScopes,
    },
    editLink: options.editBaseUrl ? { baseUrl: options.editBaseUrl } : undefined,
    tableOfContents: options.tableOfContents ?? { minHeadingLevel: 2, maxHeadingLevel: 3 },
  };
}

export async function getDocsConfig(
  options: {
    cms?: Cms;
    pages?: any[];
    fallbackConfig?: DocsConfig;
    navOptions?: DocsNavOptions;
    collection?: string;
  } = {},
): Promise<DocsConfig> {
  if (options.pages && options.pages.length > 0) {
    return buildDocsNavFromPages(options.pages, options.navOptions);
  }
  if (options.cms) {
    const { entries } = await options.cms.entries.listEntries({
      collection: options.collection ?? "doc",
      status: "published",
      orderBy: "slug",
      limit: 500,
      includeContent: true,
    });
    const pages = entries.map((e: any) => ({ ...e, properties: e.published?.properties ?? {} }));
    if (pages.length > 0) return buildDocsNavFromPages(pages, options.navOptions);
  }
  return options.fallbackConfig || defaultDocsConfig;
}
