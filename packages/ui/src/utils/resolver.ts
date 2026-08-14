import { cx } from "css-variants"
import { uiConfig } from "../config"

const classThemeCache = new WeakMap<Function, Map<string, Record<string, string>>>()
const themeCreatorCache = new WeakMap<Function>()

const EMPTY_DEFAULTS: Record<string, string | Function | undefined> = Object.freeze({})

function hasKeys(obj?: Record<string, any>): boolean {
  if (!obj) return false
  for (const _ in obj) return true
  return false
}

function getVariantCacheKey(variants?: Record<string, any>): string {
  if (!variants) return ""
  const entries = Object.entries(variants)
  if (entries.length === 0) return ""
  return entries
    .toSorted(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join(";")
}

export function useUi(
  componentName: string,
  uiProp?: Record<string, string | Function | undefined>
): Record<string, string | Function | undefined> {
  const defaults = uiConfig.themes?.[componentName]
  if (!defaults) return EMPTY_DEFAULTS
  if (!hasKeys(uiProp)) return defaults

  const result: Record<string, string | Function | undefined> = { ...defaults }
  for (const key in uiProp) {
    if (uiProp[key] != null) {
      result[key] = uiProp[key]
    }
  }

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
  const isUnstyled = uiConfig.unstyled === true

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
    resolved = fnMap.get(key) ?? fnMap.set(key, themeFn(variants)).get(key)!
  }

  const hasOverrides = hasKeys(mergedUI) || Boolean(rootClass)

  if (!hasOverrides) {
    return resolved
  }

  const result: Record<string, string> = { ...resolved }

  for (const slot in mergedUI) {
    const override = mergedUI[slot]
    if (!override) continue
    const base = result[slot] ?? ""
    result[slot] = typeof override === "function" ? cx(override(base)) : cx(base, override)
  }

  if (rootClass) {
    result.root = cx(result.root ?? "", rootClass)
  }

  return result
}
