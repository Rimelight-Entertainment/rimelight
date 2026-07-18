import { merge } from "./merge"
import { getUIConfig } from "virtual:rimelight-ui"

const mergeCache = new WeakMap<object, Record<string, string | Function | undefined>>()

export function useUi(
  componentName: string,
  uiProp?: Record<string, string | Function | undefined>
): Record<string, string | Function | undefined> {
  const globalConfig = getUIConfig()
  const defaults = globalConfig[componentName]

  if (!defaults) return {}

  if (!uiProp || Object.keys(uiProp).length === 0) {
    return defaults
  }

  const cached = mergeCache.get(uiProp)
  if (cached) return cached

  const merged = merge(uiProp, defaults)
  const result: Record<string, string | Function | undefined> = {}
  for (const key of Object.keys(merged)) {
    const value = merged[key]
    if (typeof value === "string" || typeof value === "function") {
      result[key] = value
    }
  }

  mergeCache.set(uiProp, result)
  return result
}
