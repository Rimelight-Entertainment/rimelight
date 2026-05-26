import type { DocsConfig, BadgeConfig } from "../types"

export function defineDocsConfig(config: DocsConfig): DocsConfig {
  return config
}

/** Strip a leading numeric sort prefix from a filename id, e.g. "01.getting-started" → "getting-started" */
function stripNumericPrefix(id: string): string {
  return id.replace(/^(\d+\.)+/, "")
}

/** Extract a numeric sort key from a doc id for numeric-prefix sorting */
function numericPrefixOrder(id: string): number {
  const segment = id.split("/").pop() ?? id
  const m = segment.match(/^(\d+)\./)
  return m ? parseInt(m[1], 10) : Infinity
}

export interface ResolvedSidebarItem {
  label: string
  href?: string
  icon?: string
  badge?: string | BadgeConfig
  active?: boolean
  children?: ResolvedSidebarItem[]
  collapsed?: boolean
}

export interface ResolvedScope {
  id: string
  label: string
  href: string
  icon?: string
  active?: boolean
}

export async function getDocsSidebar(
  config: DocsConfig,
  locale: string,
  currentPath: string,
  getCollection: (name: string) => Promise<any[]>
): Promise<{
  items: ResolvedSidebarItem[]
  scopes: ResolvedScope[]
  activeScope?: ResolvedScope
}> {
  const docs = await getCollection("docs")
  const normPath = currentPath.replace(/\/$/, "").toLowerCase()
  const docsBase = `/${locale}/docs`

  const scopes: ResolvedScope[] = config.sidebar
    .filter((item): item is import("../types").SidebarScope => "id" in item)
    .map(scope => ({
      id: scope.id,
      label: scope.label,
      href: scope.href.replace("{locale}", locale),
      icon: scope.icon
    }))

  function isDocInItems(items: import("../types").SidebarItem[], docId: string | undefined, href: string): boolean {
    for (const item of items) {
      if (item.href && item.href.toLowerCase().replace(/\/$/, "") === href) return true
      if (item.autogenerate && docId) {
        const dir = item.autogenerate.directory.replace(/\/$/, "")
        if (dir === "") {
          if (!docId.includes("/")) return true
        } else if (docId.startsWith(dir + "/") || docId === dir) {
          return true
        }
      }
      if (item.children && isDocInItems(item.children, docId, href)) return true
    }
    return false
  }

  // Find active scope — most-specific prefix match, fallback to scanning scope items
  let activeScope = scopes.find(s => normPath === s.href.replace(/\/$/, "").toLowerCase())
  if (!activeScope) {
    const currentDoc = docs.find(d => `${docsBase}/${d.id}`.toLowerCase() === normPath)
    const scopeMatch = config.sidebar.find(s => {
      if (!("id" in s)) return false
      return isDocInItems(s.items || [], currentDoc?.id, normPath)
    }) as import("../types").SidebarScope | undefined

    if (scopeMatch) {
      activeScope = scopes.find(s => s.id === scopeMatch.id)
    }
  }
  if (!activeScope) {
    activeScope = [...scopes]
      .sort((a, b) => b.href.length - a.href.length)
      .find(s => normPath.startsWith(s.href.toLowerCase()))
  }
  if (activeScope) activeScope.active = true

  const sidebarConfig = config.sidebar.find(item =>
    "id" in item && activeScope && item.id === activeScope.id
  ) as import("../types").SidebarScope | undefined

  const items = sidebarConfig?.items || []

  async function resolveItem(item: import("../types").SidebarItem): Promise<ResolvedSidebarItem[]> {
    if (item.autogenerate) {
      const dir = item.autogenerate.directory
      // Match docs whose id starts with the directory
      const prefix = dir.replace(/\/$/, "")
      const filteredDocs = docs.filter(d => {
        if (d.data.sidebar?.hidden === true) return false
        if (prefix === "") return !d.id.includes("/")
        return d.id.startsWith(prefix + "/") || d.id === prefix
      })

      filteredDocs.sort((a, b) => {
        // 1. Frontmatter `order` takes priority
        const aOrder = a.data.sidebar?.order ?? a.data.order ?? numericPrefixOrder(a.id)
        const bOrder = b.data.sidebar?.order ?? b.data.order ?? numericPrefixOrder(b.id)
        if (aOrder !== bOrder) return aOrder - bOrder
        // 2. Fall back to alphabetical by stripped label
        const aLabel = a.data.sidebar?.label ?? a.data.title
        const bLabel = b.data.sidebar?.label ?? b.data.title
        return stripNumericPrefix(aLabel).localeCompare(stripNumericPrefix(bLabel))
      })

      return filteredDocs.map(doc => {
        const href = `${docsBase}/${doc.id}/`
        const badge = doc.data.sidebar?.badge ?? doc.data.badge as string | BadgeConfig | undefined
        return {
          label: doc.data.sidebar?.label ?? doc.data.title,
          href,
          badge,
          active: normPath === href.replace(/\/$/, "").toLowerCase()
        }
      })
    }

    const resolved: ResolvedSidebarItem = {
      label: item.label,
      href: item.href ? item.href.replace("{locale}", locale) : undefined,
      icon: item.icon,
      badge: item.badge,
      collapsed: item.collapsed
    }

    if (resolved.href) {
      resolved.active = normPath === resolved.href.replace(/\/$/, "").toLowerCase()
    }

    if (item.children) {
      const children: ResolvedSidebarItem[] = []
      for (const child of item.children) {
        children.push(...(await resolveItem(child)))
      }
      resolved.children = children
      if (!resolved.active) {
        resolved.active = children.some(c => c.active)
      }
    }

    return [resolved]
  }

  const resolvedItems: ResolvedSidebarItem[] = []
  for (const item of items) {
    resolvedItems.push(...(await resolveItem(item)))
  }

  return { items: resolvedItems, scopes, activeScope }
}

export function getSurroundItems(sidebar: ResolvedSidebarItem[], currentPath: string) {
  const flatItems: { label: string, href: string }[] = []

  function flatten(items: ResolvedSidebarItem[]) {
    for (const item of items) {
      if (item.href) flatItems.push({ label: item.label, href: item.href })
      if (item.children) flatten(item.children)
    }
  }

  flatten(sidebar)

  const normPath = currentPath.replace(/\/$/, "").toLowerCase()
  const currentIndex = flatItems.findIndex(item => item.href.replace(/\/$/, "").toLowerCase() === normPath)

  return {
    prev: currentIndex > 0 ? flatItems[currentIndex - 1] : null,
    next: currentIndex >= 0 && currentIndex < flatItems.length - 1 ? flatItems[currentIndex + 1] : null
  }
}
