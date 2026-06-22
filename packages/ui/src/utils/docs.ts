import type {
  DocsConfig,
  BadgeConfig,
  PropMeta,
  ThemeMeta,
  SidebarItem,
  SidebarScope
} from "../types"

export function defineDocsConfig(config: DocsConfig): DocsConfig {
  return config
}

export interface ResolvedSidebarItem {
  label: string
  href?: string | undefined
  icon?: string | undefined
  badge?: string | BadgeConfig | undefined
  active?: boolean | undefined
  children?: ResolvedSidebarItem[] | undefined
  collapsed?: boolean | undefined
}

export interface ResolvedScope {
  id: string
  label: string
  href: string
  icon?: string | undefined
  active?: boolean | undefined
}

export function formatDocsUrl(
  href: string,
  locale: string,
  activeVersion?: string,
  includeVersionInUrl?: boolean
): string {
  let url = href.replace("{locale}", locale)
  if (activeVersion && includeVersionInUrl) {
    if (url.includes(`/${activeVersion}/`) || url.endsWith(`/${activeVersion}`)) {
      return url
    }
    const docsPattern = new RegExp(`(/${locale}/docs)(/|$)`)
    const companyDocsPattern = new RegExp(`(/${locale}/company/docs)(/|$)`)

    if (companyDocsPattern.test(url)) {
      url = url.replace(companyDocsPattern, `$1/${activeVersion}$2`)
    } else if (docsPattern.test(url)) {
      url = url.replace(docsPattern, `$1/${activeVersion}$2`)
    }

    url = url.replace(/\/{2,}/g, "/")
  }
  return url
}

export interface DocEntry {
  id: string
  [key: string]: any
}

export function getDocsVersions(entries: DocEntry[], locale: string): string[] {
  const versions = new Set<string>()
  for (const entry of entries) {
    const id = entry.id.replace(/\\/g, "/")
    const parts = id.split("/")
    // File structure is: [version]/[locale]/[...slug]
    if (parts[1] === locale && parts[0]?.startsWith("v")) {
      versions.add(parts[0])
    }
  }
  return Array.from(versions).toSorted((a, b) => {
    return b.localeCompare(a, undefined, { numeric: true, sensitivity: "base" })
  })
}

export function parseDocsSlug(slug: string | undefined, versions: string[]) {
  if (versions.length === 0) {
    return {
      activeVersion: "",
      contentPath: slug || "index",
      includeVersionInUrl: false
    }
  }

  const defaultVersion = versions[0]
  const isMultiVersion = versions.length > 1

  if (!slug) {
    return {
      activeVersion: defaultVersion,
      contentPath: "index",
      includeVersionInUrl: isMultiVersion
    }
  }

  const parts = slug.split("/")
  const firstPart = parts[0]

  if (firstPart && versions.includes(firstPart)) {
    return {
      activeVersion: firstPart,
      contentPath: parts.slice(1).join("/") || "index",
      includeVersionInUrl: isMultiVersion
    }
  }

  return {
    activeVersion: defaultVersion,
    contentPath: slug || "index",
    includeVersionInUrl: isMultiVersion
  }
}

function findFirstHref(
  items: SidebarItem[],
  locale: string,
  activeVersion?: string,
  includeVersionInUrl?: boolean
): string | undefined {
  for (const item of items) {
    if (item.href) return formatDocsUrl(item.href, locale, activeVersion, includeVersionInUrl)
    const childItems = item.children || item.items
    if (childItems) {
      const found = findFirstHref(childItems, locale, activeVersion, includeVersionInUrl)
      if (found) return found
    }
  }
  return undefined
}

function getScopePrefix(
  items: SidebarItem[],
  locale: string,
  activeVersion?: string,
  includeVersionInUrl?: boolean
): string {
  const allHrefs: string[] = []

  function collect(item: SidebarItem) {
    if (item.href)
      allHrefs.push(formatDocsUrl(item.href, locale, activeVersion, includeVersionInUrl))
    const childItems = item.children || item.items
    if (childItems) childItems.forEach(collect)
  }

  items.forEach(collect)
  if (allHrefs.length === 0) return ""

  const parts = allHrefs.map((h) => h.split("/").filter(Boolean))
  let commonLen = 0
  const firstPart = parts[0]
  if (!firstPart) return ""
  for (let i = 0; i < firstPart.length; i++) {
    if (parts.every((p) => p[i] === firstPart[i])) commonLen++
    else break
  }

  return "/" + firstPart.slice(0, commonLen).join("/") + "/"
}

function hasPath(
  items: SidebarItem[],
  locale: string,
  normPath: string,
  activeVersion?: string,
  includeVersionInUrl?: boolean
): boolean {
  for (const item of items) {
    if (
      item.href &&
      formatDocsUrl(item.href, locale, activeVersion, includeVersionInUrl)
        .replace(/\/$/, "")
        .toLowerCase() === normPath
    ) {
      return true
    }
    const childItems = item.children || item.items
    if (childItems && hasPath(childItems, locale, normPath, activeVersion, includeVersionInUrl)) {
      return true
    }
  }
  return false
}

export async function getDocsSidebar(
  config: DocsConfig,
  locale: string,
  currentPath: string,
  activeVersion?: string,
  includeVersionInUrl?: boolean
): Promise<{
  items: ResolvedSidebarItem[]
  scopes: ResolvedScope[]
  activeScope?: ResolvedScope | undefined
}> {
  const normPath = currentPath.replace(/\/$/, "").toLowerCase()

  const sidebarScopes: SidebarScope[] = Array.isArray(config.sidebar)
    ? config.sidebar.filter((item): item is SidebarScope => "id" in item || "scopes" in item)
    : config.sidebar.scopes || []

  const scopes: ResolvedScope[] = sidebarScopes.map((scope) => {
    const id = scope.id || scope.label
    let href = scope.href || ""
    if (!href && scope.items && scope.items.length > 0) {
      href = findFirstHref(scope.items, locale, activeVersion, includeVersionInUrl) || ""
    }
    return {
      id,
      label: scope.label,
      href: formatDocsUrl(href, locale, activeVersion, includeVersionInUrl),
      icon: scope.icon
    }
  })

  // Compute scope prefixes for active detection (separate from clickable hrefs)
  const scopePrefixes: string[] = sidebarScopes.map((scope) =>
    scope.items ? getScopePrefix(scope.items, locale, activeVersion, includeVersionInUrl) : ""
  )

  let activeScope = scopes.find((s) => normPath === s.href.replace(/\/$/, "").toLowerCase())
  if (!activeScope) {
    for (let i = 0; i < sidebarScopes.length; i++) {
      const scope = sidebarScopes[i]
      if (
        scope &&
        scope.items &&
        hasPath(scope.items, locale, normPath, activeVersion, includeVersionInUrl)
      ) {
        activeScope = scopes[i]
        break
      }
    }
  }
  if (!activeScope) {
    const sorted = [...scopePrefixes.entries()]
      .filter(([, p]) => p)
      .toSorted(([, a], [, b]) => b.length - a.length)
    for (const [i] of sorted) {
      const prefix = scopePrefixes[i]
      if (prefix && normPath.startsWith(prefix.toLowerCase())) {
        activeScope = scopes[i]
        break
      }
    }
  }
  if (!activeScope && scopes.length > 0) {
    activeScope = scopes[0]
  }
  if (activeScope) activeScope.active = true

  const sidebarConfig = sidebarScopes.find(
    (item) => activeScope && (item.id === activeScope.id || item.label === activeScope.id)
  )

  const items = sidebarConfig?.items || []

  async function resolveItem(item: SidebarItem): Promise<ResolvedSidebarItem[]> {
    const resolved: ResolvedSidebarItem = {
      label: item.label || "",
      href: item.href
        ? formatDocsUrl(item.href, locale, activeVersion, includeVersionInUrl)
        : undefined,
      icon: item.icon,
      badge: item.badge,
      collapsed: item.collapsed
    }

    if (resolved.href) {
      resolved.active = normPath === resolved.href.replace(/\/$/, "").toLowerCase()
    }

    const childItems = item.children || item.items
    if (childItems) {
      const children: ResolvedSidebarItem[] = []
      const resolvedChildren = await Promise.all(childItems.map((child) => resolveItem(child)))
      for (const res of resolvedChildren) {
        children.push(...res)
      }
      resolved.children = children
      if (!resolved.active) {
        resolved.active = children.some((c) => c.active)
      }
    }

    return [resolved]
  }

  const resolvedItems: ResolvedSidebarItem[] = []
  const resolvedAllItems = await Promise.all(items.map((item) => resolveItem(item)))
  for (const res of resolvedAllItems) {
    resolvedItems.push(...res)
  }

  return { items: resolvedItems, scopes, activeScope }
}

export function getSurroundItems(sidebar: ResolvedSidebarItem[], currentPath: string) {
  const flatItems: { label: string; href: string }[] = []

  function flatten(items: ResolvedSidebarItem[]) {
    for (const item of items) {
      if (item.href) flatItems.push({ label: item.label, href: item.href })
      if (item.children) flatten(item.children)
    }
  }

  flatten(sidebar)

  const normPath = currentPath.replace(/\/$/, "").toLowerCase()
  const currentIndex = flatItems.findIndex(
    (item) => item.href.replace(/\/$/, "").toLowerCase() === normPath
  )

  return {
    prev: currentIndex > 0 ? flatItems[currentIndex - 1] : null,
    next:
      currentIndex >= 0 && currentIndex < flatItems.length - 1 ? flatItems[currentIndex + 1] : null
  }
}

export function kebabToPascal(name: string): string {
  return name
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("")
}

export function filterProps(
  props: PropMeta[],
  options: { hide?: string[]; show?: string[] }
): PropMeta[] {
  if (options.show?.length) {
    return props.filter((p) => options.show!.includes(p.name))
  }
  if (options.hide?.length) {
    return props.filter((p) => !options.hide!.includes(p.name))
  }
  return props
}

export function generateThemeCode(componentName: string, theme: ThemeMeta): string {
  const componentConfig: Record<string, unknown> = {
    ...(theme.slots.length ? { slots: theme.slots } : {}),
    ...(Object.keys(theme.base).length ? { base: theme.base } : {}),
    ...(Object.keys(theme.variants).length ? { variants: theme.variants } : {}),
    ...(theme.compoundVariants.length ? { compoundVariants: theme.compoundVariants } : {}),
    ...(Object.keys(theme.defaultVariants).length ? { defaultVariants: theme.defaultVariants } : {})
  }

  return `// astro.config.ts
import { ui } from "@rimelight/ui"
import { defineConfig } from "astro/config"

export default defineConfig({
  integrations: [
    ui({
      components: {
        ${componentName}: ${JSON.stringify(componentConfig, null, 6).replace(/\n/g, "\n        ")}
      }
    })
  ]
})`
}
