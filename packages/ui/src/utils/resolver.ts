import { cx } from "css-variants"
import { uiConfig, type Override } from "../config"

const classCache = new WeakMap<(...args: any[]) => any, Map<string, Record<string, string>>>()
const themeCreatorCache = new WeakMap<object>()
const EMPTY: Record<string, Override> = Object.freeze({})

export const useUi = (name: string, prop?: Record<string, Override>): Record<string, Override> => {
  const global = uiConfig.themes?.[name]?.slots
  return global && prop ? { ...global, ...prop } : (global ?? prop ?? EMPTY)
}

export function resolveTheme<T>(fallback: T, create?: (colors: readonly string[]) => T): T {
  if (!uiConfig.colors || !create) return fallback
  let c = themeCreatorCache.get(create)
  if (!c) themeCreatorCache.set(create, (c = create(uiConfig.colors)))
  return c
}

export function resolveClasses<T extends (...args: never[]) => Record<string, string>>(
  themeFn: T,
  variants: Parameters<T>[0],
  ui: Record<string, Override>,
  rootClass?: string
): Record<string, string> {
  if (uiConfig.unstyled) return rootClass ? { root: rootClass } : {}

  let map = classCache.get(themeFn)
  if (!map) classCache.set(themeFn, (map = new Map()))

  let key = ""
  if (variants) {
    const keys = Object.keys(variants)
    const len = keys.length
    if (len === 1) {
      key = `${keys[0]}:${String(variants[keys[0]!])}`
    } else if (len > 1) {
      keys.sort()
      for (let i = 0; i < len; i++) {
        const k = keys[i]!
        key += (i ? ";" : "") + k + ":" + String(variants[k])
      }
    }
  }

  let cached = map.get(key)
  if (!cached) map.set(key, (cached = themeFn(variants)))

  const hasUiOverrides = ui !== EMPTY && Object.keys(ui).length > 0
  if (!hasUiOverrides && !rootClass) return cached

  const res: Record<string, string> = { ...cached }
  for (const slot in ui) {
    const o = ui[slot]
    if (o) res[slot] = typeof o === "function" ? cx(o(res[slot] ?? "")) : cx(res[slot], o)
  }
  if (rootClass) res.root = cx(res.root, rootClass)
  return res
}
