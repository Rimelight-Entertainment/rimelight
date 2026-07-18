import { DEFAULT_ICONS } from "./defaults"
import { getUIConfig } from "virtual:rimelight-ui"

export interface ResolvedIcon {
  isClass: boolean
  content: string
}

const defaultIconsLookup = DEFAULT_ICONS as Record<string, string>

/**
 * Resolves whether an icon is a CSS class or raw inline SVG string, falling back to DEFAULT_ICONS.
 * Supports both static virtual config overrides and custom dynamic overrides (e.g. props).
 */
export function resolveIcon(iconKey: string, customProp?: string): ResolvedIcon {
  if (iconKey.startsWith("i-") || iconKey.includes(":")) {
    return { isClass: true, content: iconKey }
  }

  let config: Record<string, any> = {}
  try {
    config = getUIConfig()
  } catch {}

  const resolved = customProp || config.icons?.[iconKey]

  if (!resolved) {
    return { isClass: false, content: defaultIconsLookup[iconKey] || "" }
  }

  const isClass =
    typeof resolved === "string" && (resolved.startsWith("i-") || resolved.includes(":"))
  return { isClass, content: resolved }
}
