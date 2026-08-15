import { cx } from "css-variants"
import { uiConfig, type Override } from "../config"

const classCache = new WeakMap<(...args: any[]) => any, Map<string, Record<string, string>>>()
const themeCreatorCache = new WeakMap<Function>()
const EMPTY: Record<string, Override> = Object.freeze({})

export const useUi = (name: string, prop?: Record<string, Override>): Record<string, Override> => {
  const global = uiConfig.themes?.[name]?.slots
  return global && prop ? { ...global, ...prop } : (global ?? prop ?? EMPTY)
}

export function resolveTheme<T>(fallback: T, create?: (colors: readonly string[]) => T): T {
  if (!uiConfig.colors || !create) return fallback
  let c: T | undefined = themeCreatorCache.get(create)
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
    const keys = Object.keys(variants).toSorted()
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i]!
      key += `${i ? ";" : ""}${k}:${String((variants as Record<string, unknown>)[k])}`
    }
  }

  let cached = map.get(key)
  if (!cached) map.set(key, (cached = themeFn(variants)))

  if ((ui === EMPTY || !Object.keys(ui).length) && !rootClass) return cached

  const res: Record<string, string> = { ...cached }
  for (const slot in ui) {
    const o = ui[slot]
    if (o) res[slot] = typeof o === "function" ? cx(o(res[slot] ?? "")) : cx(res[slot], o)
  }
  if (rootClass) res.root = cx(res.root, rootClass)
  return res
}
