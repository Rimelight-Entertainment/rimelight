import { cx } from "css-variants"
import { uiConfig } from "../config"

const classThemeCache = new WeakMap<Function, Map<string, Record<string, string>>>()
const themeCreatorCache = new WeakMap<Function>()
const uiMergeCache = new WeakMap<object, Record<string, string | Function | undefined>>()

const EMPTY_DEFAULTS: Record<string, string | Function | undefined> = Object.freeze({})

function getVariantCacheKey(variants?: Record<string, any>): string {
  if (!variants) return ""
  return Object.keys(variants)
    .toSorted()
    .map((k) => `${k}:${variants[k]}`)
    .join(";")
}

export function useUi(
  componentName: string,
  uiProp?: Record<string, string | Function | undefined>
): Record<string, string | Function | undefined> {
  const defaults = uiConfig[componentName]
  if (!defaults) return EMPTY_DEFAULTS
  if (!uiProp || Object.keys(uiProp).length === 0) return defaults

  const cached = uiMergeCache.get(uiProp)
  if (cached) return cached

  const result: Record<string, string | Function | undefined> = { ...defaults }
  for (const key in uiProp) {
    if (uiProp[key] != null) {
      result[key] = uiProp[key]
    }
  }

  uiMergeCache.set(uiProp, result)
  return result
}

export function resolveTheme<T>(
  themeDefault: T,
  themeCreator?: (colors: readonly string[]) => T
): T {
  if (uiConfig.colors && themeCreator) {
    let cached: T | undefined = themeCreatorCache.get(themeCreator)
    if (!cached) {
      cached = themeCreator(uiConfig.colors)
      themeCreatorCache.set(themeCreator, cached)
    }
    return cached
  }
  return themeDefault
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
    let fnMap = classThemeCache.get(themeFn)
    if (!fnMap) {
      fnMap = new Map()
      classThemeCache.set(themeFn, fnMap)
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
    for (const slot in mergedUI) {
      const override = mergedUI[slot]
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
    if (!override) {
      result[slot] = value
    } else if (typeof override === "function") {
      result[slot] = cx(override(value))
    } else {
      result[slot] = cx(value, override)
    }
  }

  for (const slot in mergedUI) {
    if (!(slot in resolved) && slot !== "root") {
      const override = mergedUI[slot]
      if (typeof override === "function") {
        result[slot] = cx(override(""))
      } else if (override) {
        result[slot] = cx(override)
      }
    }
  }

  if (rootClass) {
    result.root = cx(result.root ?? "", rootClass)
  }

  return result
}
