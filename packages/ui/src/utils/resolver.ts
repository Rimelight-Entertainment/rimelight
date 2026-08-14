import { cx } from "css-variants"
import { uiConfig } from "../config"

type Override = string | ((base: string) => string) | undefined
const classCache = new WeakMap<(...args: any[]) => any, Map<string, Record<string, string>>>()
const themeCreatorCache = new WeakMap<(...args: any[]) => any>()
const EMPTY: Record<string, Override> = Object.freeze({})

export const useUi = (name: string, prop?: Record<string, Override>): Record<string, Override> => {
  const d = uiConfig.themes?.[name]
  return d ? (prop ? { ...d, ...prop } : d) : (prop ?? EMPTY)
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

  const key = variants
    ? Object.keys(variants)
        .toSorted()
        .reduce((acc, k) => `${acc}${k}:${String((variants as Record<string, unknown>)[k])};`, "")
    : ""
  let cached = map.get(key)
  if (!cached) map.set(key, (cached = themeFn(variants)))

  if (ui === EMPTY && !rootClass) return cached

  const res: Record<string, string> = { ...cached }
  for (const slot in ui) {
    const o = ui[slot]
    if (o) res[slot] = typeof o === "function" ? cx(o(res[slot] ?? "")) : cx(res[slot] ?? "", o)
  }
  if (rootClass) res.root = cx(res.root ?? "", rootClass)
  return res
}
