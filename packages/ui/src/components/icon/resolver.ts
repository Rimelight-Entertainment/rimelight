import { DEFAULT_ICONS } from "../../icons/defaults"
import { uiConfig } from "../../utils/resolver"

export interface ResolvedIcon {
  isClass: boolean
  content: string
}

const defaultIconsLookup = DEFAULT_ICONS as Record<string, string>
const iconCache = new Map<string, ResolvedIcon>()

export function resolveIcon(iconKey?: string, customProp?: string): ResolvedIcon {
  if (!iconKey) {
    return { isClass: false, content: "" }
  }

  // Fast path: direct UnoCSS iconify class syntax
  if (iconKey.startsWith("i-") || iconKey.includes(":")) {
    return { isClass: true, content: iconKey }
  }

  const cacheKey = customProp ? `${iconKey}:${customProp}` : iconKey
  const cached = iconCache.get(cacheKey)
  if (cached) return cached

  const resolved = customProp || uiConfig.icons?.[iconKey]

  let result: ResolvedIcon
  if (!resolved) {
    result = { isClass: false, content: defaultIconsLookup[iconKey] || "" }
  } else {
    const isClass =
      typeof resolved === "string" && (resolved.startsWith("i-") || resolved.includes(":"))
    result = { isClass, content: resolved }
  }

  iconCache.set(cacheKey, result)
  return result
}
