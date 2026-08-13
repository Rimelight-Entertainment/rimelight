import { cx } from "css-variants"
import { getUIConfig } from "virtual:rimelight-ui"

// Hoisted once at module load — getUIConfig() returns a static frozen object.
const uiConfig = getUIConfig()

const themeCache = new WeakMap<Function, Map<string, Record<string, string>>>()

function getVariantCacheKey(variants: Record<string, any>): string {
  if (!variants) return ""
  let key = ""
  for (const k in variants) {
    key += `${k}:${variants[k]};`
  }
  return key
}

export function resolveClasses<T extends (...args: never[]) => Record<string, string>>(
  themeFn: T,
  variants: Parameters<T>[0],
  mergedUI: Record<string, string | Function | undefined>,
  rootClass?: string
): Record<string, string> {
  const isUnstyled = uiConfig?.unstyled === true

  let resolved: Record<string, string>
  if (isUnstyled) {
    resolved = {}
  } else {
    let fnMap = themeCache.get(themeFn)
    if (!fnMap) {
      fnMap = new Map()
      themeCache.set(themeFn, fnMap)
    }
    const key = getVariantCacheKey(variants as Record<string, any>)
    const cached = fnMap.get(key)
    if (cached) {
      resolved = cached
    } else {
      resolved = themeFn(variants)
      fnMap.set(key, resolved)
    }
  }

  const hasOverrides = (mergedUI && Object.keys(mergedUI).length > 0) || Boolean(rootClass)
  if (!hasOverrides) {
    return resolved
  }

  const result: Record<string, string> = {}

  if (isUnstyled) {
    if (rootClass) result.root = cx(rootClass)
    for (const [slot, override] of Object.entries(mergedUI)) {
      if (typeof override === "function") {
        result[slot] = cx(override(""))
      } else if (override) {
        result[slot] = cx(override)
      }
    }
    return result
  }

  for (const slot in resolved) {
    const value = resolved[slot] ?? ""
    const override = mergedUI[slot]
    if (typeof override === "function") {
      result[slot] = cx(override(value))
    } else {
      result[slot] = cx(value, override)
    }
  }

  if (rootClass) {
    result.root = cx(result.root ?? "", rootClass)
  }

  return result
}
