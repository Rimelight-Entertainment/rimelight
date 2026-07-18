import { merge } from "./merge"
// @ts-ignore - virtual module resolved by Astro integration
import { getUIConfig } from "virtual:rimelight-ui"

const mergeCache = new WeakMap<object, Record<string, string | undefined>>()

export function useUi(
  componentName: string,
  uiProp?: Record<string, string | undefined>
): Record<string, string | undefined> {
  const globalConfig = getUIConfig()
  const defaults = globalConfig[componentName]

  if (!defaults) return {}

  if (!uiProp || Object.keys(uiProp).length === 0) {
    return defaults
  }

  const cached = mergeCache.get(uiProp)
  if (cached) return cached

  const merged = merge(uiProp, defaults)
  const result: Record<string, string | undefined> = {}
  for (const key of Object.keys(merged)) {
    const value = merged[key]
    if (typeof value === "string") result[key] = value
  }

  mergeCache.set(uiProp, result)
  return result
}
