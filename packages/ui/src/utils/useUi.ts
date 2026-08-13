import { getUIConfig } from "virtual:rimelight-ui"

const mergeCache = new WeakMap<object, Record<string, string | Function | undefined>>()
const EMPTY_DEFAULTS: Record<string, string | Function | undefined> = Object.freeze({})

function hasOwnProperties(obj: object): boolean {
  for (const k in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) return true
  }
  return false
}

export function useUi(
  componentName: string,
  uiProp?: Record<string, string | Function | undefined>
): Record<string, string | Function | undefined> {
  const globalConfig = getUIConfig()
  const defaults = globalConfig[componentName]

  if (!defaults) return EMPTY_DEFAULTS

  if (!uiProp || !hasOwnProperties(uiProp)) {
    return defaults
  }

  const cached = mergeCache.get(uiProp)
  if (cached) return cached

  // Direct fast path for slot class overrides (flat string / function maps)
  const result: Record<string, string | Function | undefined> = { ...defaults }
  for (const key in uiProp) {
    if (Object.prototype.hasOwnProperty.call(uiProp, key)) {
      const val = uiProp[key]
      if (val !== undefined && val !== null) {
        result[key] = val
      }
    }
  }

  mergeCache.set(uiProp, result)
  return result
}
