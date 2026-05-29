import type { DocsConfig, BadgeConfig, PropMeta, ThemeMeta } from "../types"

export function defineDocsConfig(config: DocsConfig): DocsConfig {
  return config
}

/**
 * Strip a leading numeric sort prefix from a filename id, e.g. "01.getting-started" →
 * "getting-started"
 */
function stripNumericPrefix(id: string): string {
  return id.replace(/^(\d+\.)+/, "")
}

/**
 * Extract a numeric sort key from a doc id for numeric-prefix sorting
 */
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

function getDocHref(docId: string, locale: string, docsBase: string): string {
  let cleanId = docId
  if (cleanId.startsWith(locale + "/")) {
    cleanId = cleanId.substring(locale.length + 1)
  }
  
  const cleanDocsBase = docsBase.replace(/^\/+|\/+$/g, "")
  const normCleanId = cleanId.replace(/^\/+|\/+$/g, "")
  
  let parts: string[]
  if (normCleanId.startsWith(cleanDocsBase + "/") || normCleanId === cleanDocsBase) {
    parts = [locale, normCleanId]
  } else {
    parts = [locale, cleanDocsBase, normCleanId]
  }
  
  const finalParts = parts.map(p => p.replace(/^\/+|\/+$/g, "")).filter(Boolean)
  return "/" + finalParts.join("/") + "/"
}

function findFirstHref(
  items: import("../types").SidebarItem[],
  locale: string,
  docs: any[],
  docsBase: string
): string | undefined {
  for (const item of items) {
    if (item.href) {
      return item.href.replace("{locale}", locale)
    }
    if (item.autogenerate) {
      const dir = item.autogenerate.directory.replace(/\/$/, "")
      
      const cleanDocsBase = docsBase.replace(/^\/+|\/+$/g, "")
      let prefix = dir
      if (cleanDocsBase && (prefix.startsWith(cleanDocsBase + "/") || prefix === cleanDocsBase)) {
        prefix = prefix.substring(cleanDocsBase.length).replace(/^\/|\/$/g, "")
      }

      const filteredDocs = docs.filter((d) => {
        if (d.data.sidebar?.hidden === true) return false
        
        let relId = d.id
        if (d.id.startsWith(locale + "/")) {
          relId = d.id.substring(locale.length + 1)
        } else if (d.id.includes("/")) {
          const firstSeg = d.id.split("/")[0]
          if (firstSeg.length === 2 && firstSeg !== locale) {
            return false
          }
        }
        
        if (prefix === "") return !relId.includes("/")
        return relId.startsWith(prefix + "/") || relId === prefix
      })
      if (filteredDocs.length > 0) {
        filteredDocs.sort((a, b) => {
          const aOrder = a.data.sidebar?.order ?? a.data.order ?? numericPrefixOrder(a.id)
          const bOrder = b.data.sidebar?.order ?? b.data.order ?? numericPrefixOrder(b.id)
          if (aOrder !== bOrder) return aOrder - bOrder
          const aLabel = a.data.sidebar?.label ?? a.data.title
          const bLabel = b.data.sidebar?.label ?? b.data.title
          return stripNumericPrefix(aLabel).localeCompare(stripNumericPrefix(bLabel))
        })
        return getDocHref(filteredDocs[0].id, locale, docsBase)
      }
    }
    const childItems = item.children || item.items
    if (childItems) {
      const found = findFirstHref(childItems, locale, docs, docsBase)
      if (found) return found
    }
  }
  return undefined
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
  
  let docsBase = config.basePath ? config.basePath.replace("{locale}", "").replace(/^\/|\/$/g, "") : ""
  if (!docsBase) {
    const docsMatch = currentPath.toLowerCase().match(/^\/[^/]+\/(?:[^/]+\/)*docs/)
    docsBase = docsMatch ? currentPath.slice(0, docsMatch[0].length).replace(/^\/[^/]+/, "").replace(/^\/|\/$/g, "") : "docs"
  }

  const sidebarScopes: import("../types").SidebarScope[] = Array.isArray(config.sidebar)
    ? config.sidebar.filter(
        (item): item is import("../types").SidebarScope => "id" in item || "scopes" in item
      )
    : (config.sidebar as any)?.scopes || []

  const scopes: ResolvedScope[] = sidebarScopes.map((scope) => {
    const id = scope.id || scope.label
    let href = scope.href || ""
    if (!href && scope.items && scope.items.length > 0) {
      href = findFirstHref(scope.items, locale, docs, docsBase) || ""
    }
    return {
      id,
      label: scope.label,
      href: href.replace("{locale}", locale),
      icon: scope.icon
    }
  })

  function isDocInItems(
    items: import("../types").SidebarItem[],
    docId: string | undefined,
    href: string
  ): boolean {
    for (const item of items) {
      if (item.href && item.href.toLowerCase().replace(/\/$/, "") === href) return true
      if (item.autogenerate && docId) {
        const dir = item.autogenerate.directory.replace(/\/$/, "")
        let relDocId = docId
        if (docId.startsWith(locale + "/")) {
          relDocId = docId.substring(locale.length + 1)
        }
        
        const cleanDocsBase = docsBase.replace(/^\/+|\/+$/g, "")
        let prefix = dir
        if (cleanDocsBase && (prefix.startsWith(cleanDocsBase + "/") || prefix === cleanDocsBase)) {
          prefix = prefix.substring(cleanDocsBase.length).replace(/^\/|\/$/g, "")
        }

        if (prefix === "") {
          if (!relDocId.includes("/")) return true
        } else if (relDocId.startsWith(prefix + "/") || relDocId === prefix) {
          return true
        }
      }
      const childItems = item.children || item.items
      if (childItems && isDocInItems(childItems, docId, href)) return true
    }
    return false
  }

  // Find active scope — most-specific prefix match, fallback to scanning scope items
  let activeScope = scopes.find((s) => normPath === s.href.replace(/\/$/, "").toLowerCase())
  if (!activeScope) {
    const currentDoc = docs.find((d) => {
      const href = getDocHref(d.id, locale, docsBase)
      return href.toLowerCase().replace(/\/$/, "") === normPath
    })
    const scopeMatch = sidebarScopes.find((s) => {
      return isDocInItems(s.items || [], currentDoc?.id, normPath)
    })

    if (scopeMatch) {
      const matchId = scopeMatch.id || scopeMatch.label
      activeScope = scopes.find((s) => s.id === matchId)
    }
  }
  if (!activeScope) {
    activeScope = [...scopes]
      .toSorted((a, b) => b.href.length - a.href.length)
      .find((s) => normPath.startsWith(s.href.toLowerCase()))
  }
  if (!activeScope && scopes.length > 0) {
    activeScope = scopes[0]
  }
  if (activeScope) activeScope.active = true

  const sidebarConfig = sidebarScopes.find(
    (item) => activeScope && (item.id === activeScope.id || item.label === activeScope.id)
  )

  const items = sidebarConfig?.items || []

  async function resolveItem(item: import("../types").SidebarItem): Promise<ResolvedSidebarItem[]> {
    if (item.autogenerate) {
      const dir = item.autogenerate.directory
      
      const cleanDocsBase = docsBase.replace(/^\/+|\/+$/g, "")
      let prefix = dir.replace(/\/$/, "")
      if (cleanDocsBase && (prefix.startsWith(cleanDocsBase + "/") || prefix === cleanDocsBase)) {
        prefix = prefix.substring(cleanDocsBase.length).replace(/^\/|\/$/g, "")
      }

      const filteredDocs = docs.filter((d) => {
        if (d.data.sidebar?.hidden === true) return false
        
        let relId = d.id
        if (d.id.startsWith(locale + "/")) {
          relId = d.id.substring(locale.length + 1)
        } else if (d.id.includes("/")) {
          const firstSeg = d.id.split("/")[0]
          if (firstSeg.length === 2 && firstSeg !== locale) {
            return false
          }
        }
        
        if (prefix === "") return !relId.includes("/")
        return relId.startsWith(prefix + "/") || relId === prefix
      })

      filteredDocs.sort((a, b) => {
        const aOrder = a.data.sidebar?.order ?? a.data.order ?? numericPrefixOrder(a.id)
        const bOrder = b.data.sidebar?.order ?? b.data.order ?? numericPrefixOrder(b.id)
        if (aOrder !== bOrder) return aOrder - bOrder
        const aLabel = a.data.sidebar?.label ?? a.data.title
        const bLabel = b.data.sidebar?.label ?? b.data.title
        return stripNumericPrefix(aLabel).localeCompare(stripNumericPrefix(bLabel))
      })

      return filteredDocs.map((doc) => {
        const href = getDocHref(doc.id, locale, docsBase)
        const badge =
          doc.data.sidebar?.badge ?? (doc.data.badge as string | BadgeConfig | undefined)
        return {
          label: doc.data.sidebar?.label ?? doc.data.title,
          href,
          badge,
          active: normPath === href.replace(/\/$/, "").toLowerCase()
        }
      })
    }

    const resolved: ResolvedSidebarItem = {
      label: item.label || "",
      href: item.href ? item.href.replace("{locale}", locale) : undefined,
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
      for (const child of childItems) {
        children.push(...(await resolveItem(child)))
      }
      resolved.children = children
      if (!resolved.active) {
        resolved.active = children.some((c) => c.active)
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
