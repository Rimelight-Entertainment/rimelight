import { DEFAULT_ICONS } from "./defaults"
import { getUIConfig } from "virtual:rimelight-ui"

/**
 * Resolves whether an icon is a CSS class or raw inline SVG string, falling back to DEFAULT_ICONS.
 * Supports both static virtual config overrides and custom dynamic overrides (e.g. props).
 */
export function resolveIcon(iconKey: string, customProp?: string) {
  // If the iconKey itself is already a class name (e.g., "i-lucide-chevron-down" or "lucide:chevron-down")
  if (typeof iconKey === "string" && (iconKey.startsWith("i-") || iconKey.includes(":"))) {
    return {
      isClass: true,
      content: iconKey
    }
  }

  let config: any = {}
  try {
    config = getUIConfig()
  } catch {
    // Fallback for non-Vite/test environments
  }

  const resolved = customProp || config.icons?.[iconKey]

  if (!resolved) {
    return {
      isClass: false,
      content: (DEFAULT_ICONS as Record<string, string>)[iconKey] || ""
    }
  }

  const isClass =
    typeof resolved === "string" && (resolved.startsWith("i-") || resolved.includes(":"))
  return {
    isClass,
    content: resolved
  }
}
