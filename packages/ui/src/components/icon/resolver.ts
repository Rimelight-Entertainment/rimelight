import { DEFAULT_ICONS } from "../../icons/defaults"
import { getUIConfig } from "virtual:rimelight-ui"

export interface ResolvedIcon {
  isClass: boolean
  content: string
}

const defaultIconsLookup = DEFAULT_ICONS as Record<string, string>
const iconCache = new Map<string, ResolvedIcon>()

let uiConfigCache: Record<string, any> | null = null
function getCachedConfig(): Record<string, any> {
  if (!uiConfigCache) {
    try {
      uiConfigCache = getUIConfig() ?? {}
    } catch {
      uiConfigCache = {}
    }
  }
  return uiConfigCache
}

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

  const config = getCachedConfig()
  const resolved = customProp || config.icons?.[iconKey]

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
