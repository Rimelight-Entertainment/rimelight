import { DEFAULT_ICONS } from "../../icons/defaults"
import { getUIConfig } from "virtual:rimelight-ui"

export interface ResolvedIcon {
  isClass: boolean
  content: string
}

const defaultIconsLookup = DEFAULT_ICONS as Record<string, string>

export function resolveIcon(iconKey?: string, customProp?: string): ResolvedIcon {
  if (!iconKey) {
    return { isClass: false, content: "" }
  }
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
