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

  // Direct fast path for slot class overrides (flat string / function maps)
  const result: Record<string, string | Function | undefined> = { ...defaults }
  for (const key of Object.keys(uiProp)) {
    const val = uiProp[key]
    if (val !== undefined && val !== null) {
      result[key] = val
    }
  }

  mergeCache.set(uiProp, result)
  return result
}
