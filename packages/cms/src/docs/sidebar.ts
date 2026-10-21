import type { DocsConfig, SidebarItem, SidebarScope, RLBadgeProps } from "./config";
import { defaultDocsConfig, buildDocsNavFromPages } from "./config";

export interface ResolvedSidebarItem {
  label: string;
  href?: string | undefined;
  icon?: string | undefined;
  badge?: string | RLBadgeProps | undefined;
  active?: boolean | undefined;
  children?: ResolvedSidebarItem[] | undefined;
  collapsed?: boolean | undefined;
}

export interface ResolvedScope {
  id: string;
  label: string;
  href: string;
  icon?: string | undefined;
  active?: boolean | undefined;
}

function formatDocsUrl(
  href: string,
  locale: string,
  activeVersion?: string,
  includeVersionInUrl?: boolean,
): string {
  let url = href.replace("{locale}", locale);
  if (activeVersion && includeVersionInUrl) {
    if (url.includes(`/${activeVersion}/`) || url.endsWith(`/${activeVersion}`)) {
      return url;
    }
    const docsPattern = new RegExp(`(/${locale}/docs)(/|$)`);
    const companyDocsPattern = new RegExp(`(/${locale}/company/docs)(/|$)`);

    if (companyDocsPattern.test(url)) {
      url = url.replace(companyDocsPattern, `$1/${activeVersion}$2`);
    } else if (docsPattern.test(url)) {
      url = url.replace(docsPattern, `$1/${activeVersion}$2`);
    }

    url = url.replace(/\/{2,}/g, "/");
  }
  return url;
}

function findFirstHref(
  items: SidebarItem[],
  locale: string,
  activeVersion?: string,
  includeVersionInUrl?: boolean,
): string | undefined {
  for (const item of items) {
    if (item.href) return formatDocsUrl(item.href, locale, activeVersion, includeVersionInUrl);
    const childItems = item.children || item.items;
    if (childItems) {
      const found = findFirstHref(childItems, locale, activeVersion, includeVersionInUrl);
      if (found) return found;
    }
  }
  return undefined;
}

function getScopePrefix(
  items: SidebarItem[],
  locale: string,
  activeVersion?: string,
  includeVersionInUrl?: boolean,
): string {
  const allHrefs: string[] = [];

  function collect(item: SidebarItem) {
    if (item.href)
      allHrefs.push(formatDocsUrl(item.href, locale, activeVersion, includeVersionInUrl));
    const childItems = item.children || item.items;
    if (childItems) childItems.forEach(collect);
  }

  items.forEach(collect);
  if (allHrefs.length === 0) return "";

  const parts = allHrefs.map((h) => h.split("/").filter(Boolean));
  let commonLen = 0;
  const firstPart = parts[0];
  if (!firstPart) return "";
  for (let i = 0; i < firstPart.length; i++) {
    if (parts.every((p) => p[i] === firstPart[i])) commonLen++;
    else break;
  }

  return "/" + firstPart.slice(0, commonLen).join("/") + "/";
}

function hasPath(
  items: SidebarItem[],
  locale: string,
  normPath: string,
  activeVersion?: string,
  includeVersionInUrl?: boolean,
): boolean {
  for (const item of items) {
    if (
      item.href &&
      formatDocsUrl(item.href, locale, activeVersion, includeVersionInUrl)
        .replace(/\/$/, "")
        .toLowerCase() === normPath
    ) {
      return true;
    }
    const childItems = item.children || item.items;
    if (childItems && hasPath(childItems, locale, normPath, activeVersion, includeVersionInUrl)) {
      return true;
    }
  }
  return false;
}

export async function getDocsSidebar(
  config?: DocsConfig | any[] | null,
  locale = "en",
  currentPath = "",
  activeVersion?: string,
  includeVersionInUrl?: boolean,
): Promise<{
  items: ResolvedSidebarItem[];
  scopes: ResolvedScope[];
  activeScope?: ResolvedScope | undefined;
}> {
  let resolvedConfig: DocsConfig;
  if (!config) {
    resolvedConfig = defaultDocsConfig;
  } else if (Array.isArray(config)) {
    if (config.length > 0 && ("slug" in config[0] || "content" in config[0])) {
      resolvedConfig = buildDocsNavFromPages(config, { locale });
    } else {
      resolvedConfig = { sidebar: config };
    }
  } else {
    resolvedConfig = config;
  }

  const normPath = currentPath.replace(/\/$/, "").toLowerCase();

  const sidebarScopes: SidebarScope[] = Array.isArray(resolvedConfig.sidebar)
    ? resolvedConfig.sidebar.filter(
        (item): item is SidebarScope => "id" in item || "scopes" in item,
      )
    : resolvedConfig.sidebar?.scopes || [];

  const scopes: ResolvedScope[] = sidebarScopes.map((scope) => {
    const id = scope.id || scope.label;
    let href = scope.href || "";
    if (!href && scope.items && scope.items.length > 0) {
      href = findFirstHref(scope.items, locale, activeVersion, includeVersionInUrl) || "";
    }
    return {
      id,
      label: scope.label,
      href: formatDocsUrl(href, locale, activeVersion, includeVersionInUrl),
      icon: scope.icon,
    };
  });

  const scopePrefixes: string[] = sidebarScopes.map((scope) =>
    scope.items ? getScopePrefix(scope.items, locale, activeVersion, includeVersionInUrl) : "",
  );

  let activeScope = scopes.find((s) => normPath === s.href.replace(/\/$/, "").toLowerCase());
  if (!activeScope) {
    for (let i = 0; i < sidebarScopes.length; i++) {
      const scope = sidebarScopes[i];
      if (
        scope &&
        scope.items &&
        hasPath(scope.items, locale, normPath, activeVersion, includeVersionInUrl)
      ) {
        activeScope = scopes[i];
        break;
      }
    }
  }
  if (!activeScope) {
    const sorted = [...scopePrefixes.entries()]
      .filter(([, p]) => p)
      .toSorted(([, a], [, b]) => b.length - a.length);
    for (const [i] of sorted) {
      const prefix = scopePrefixes[i];
      if (prefix && normPath.startsWith(prefix.toLowerCase())) {
        activeScope = scopes[i];
        break;
      }
    }
  }
  if (!activeScope && scopes.length > 0) {
    activeScope = scopes[0];
  }
  if (activeScope) activeScope.active = true;

  const sidebarConfig = sidebarScopes.find(
    (item) => activeScope && (item.id === activeScope.id || item.label === activeScope.id),
  );

  const items = sidebarConfig?.items || [];

  async function resolveItem(item: SidebarItem): Promise<ResolvedSidebarItem[]> {
    const resolved: ResolvedSidebarItem = {
      label: item.label || "",
      href: item.href
        ? formatDocsUrl(item.href, locale, activeVersion, includeVersionInUrl)
        : undefined,
      icon: item.icon,
      badge: item.badge,
      collapsed: item.collapsed,
    };

    if (resolved.href) {
      resolved.active = normPath === resolved.href.replace(/\/$/, "").toLowerCase();
    }

    const childItems = item.children || item.items;
    if (childItems) {
      const children: ResolvedSidebarItem[] = [];
      const resolvedChildren = await Promise.all(childItems.map((child) => resolveItem(child)));
      for (const res of resolvedChildren) {
        children.push(...res);
      }
      resolved.children = children;
      if (!resolved.active) {
        resolved.active = children.some((c) => c.active);
      }
    }

    return [resolved];
  }

  const resolvedItems: ResolvedSidebarItem[] = [];
  const resolvedAllItems = await Promise.all(items.map((item) => resolveItem(item)));
  for (const res of resolvedAllItems) {
    resolvedItems.push(...res);
  }

  return { items: resolvedItems, scopes, activeScope };
}

export function getSurroundItems(sidebar: ResolvedSidebarItem[], currentPath: string) {
  const flatItems: { label: string; href: string }[] = [];

  function flatten(items: ResolvedSidebarItem[]) {
    for (const item of items) {
      if (item.href) flatItems.push({ label: item.label, href: item.href });
      if (item.children) flatten(item.children);
    }
  }

  flatten(sidebar);

  const normPath = currentPath.replace(/\/$/, "").toLowerCase();
  const currentIndex = flatItems.findIndex(
    (item) => item.href.replace(/\/$/, "").toLowerCase() === normPath,
  );

  return {
    prev: currentIndex > 0 ? flatItems[currentIndex - 1] : null,
    next:
      currentIndex >= 0 && currentIndex < flatItems.length - 1 ? flatItems[currentIndex + 1] : null,
  };
}
