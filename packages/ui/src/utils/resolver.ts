import { cx } from "css-variants"
import { uiConfig } from "../config"

const classThemeCache = new WeakMap<Function, Map<string, Record<string, string>>>()
const themeCreatorCache = new WeakMap<Function>()

const EMPTY_DEFAULTS: Record<string, string | Function | undefined> = Object.freeze({})

function getVariantCacheKey(variants?: Record<string, any>): string {
  if (!variants) return ""
  let key = ""
  for (const k of Object.keys(variants).toSorted()) {
    key += `${k}:${variants[k]};`
  }
  return key
}

export function useUi(
  componentName: string,
  uiProp?: Record<string, string | Function | undefined>
): Record<string, string | Function | undefined> {
  const defaults = uiConfig.themes?.[componentName]
  if (!defaults) return uiProp ?? EMPTY_DEFAULTS
  if (!uiProp) return defaults
  return { ...defaults, ...uiProp }
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
  if (uiConfig.unstyled === true) {
    return rootClass ? { root: rootClass } : {}
  }

  let fnMap = classThemeCache.get(themeFn)
  if (!fnMap) {
    fnMap = new Map()
    classThemeCache.set(themeFn, fnMap)
  }
  const key = getVariantCacheKey(variants as Record<string, any>)
  let cached = fnMap.get(key)
  if (!cached) {
    cached = themeFn(variants)
    fnMap.set(key, cached)
  }

  const hasUiOverrides = mergedUI && Object.keys(mergedUI).length > 0
  if (!hasUiOverrides && !rootClass) {
    return cached
  }

  const result: Record<string, string> = { ...cached }

  if (hasUiOverrides) {
    for (const slot in mergedUI) {
      const override = mergedUI[slot]
      if (!override) continue
      const base = result[slot] ?? ""
      result[slot] = typeof override === "function" ? cx(override(base)) : cx(base, override)
    }
  }

  if (rootClass) {
    result.root = cx(result.root ?? "", rootClass)
  }

  return result
}
