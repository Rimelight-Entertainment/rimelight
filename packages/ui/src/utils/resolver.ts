import { cx } from "css-variants"
import { uiConfig, type Override } from "../config"

const classCache = new WeakMap<(...args: any[]) => any, Map<string, Record<string, string>>>()
const themeCreatorCache = new WeakMap<object>()
const EMPTY: Record<string, Override> = Object.freeze({})

export const useUi = (name: string, prop?: Record<string, Override>): Record<string, Override> => {
  const slots = uiConfig.themes?.[name]?.slots
  return slots && prop ? { ...slots, ...prop } : (slots ?? prop ?? EMPTY)
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

  const varKeys = variants ? Object.keys(variants) : []
  const len = varKeys.length
  const key =
    len === 0
      ? ""
      : len === 1
        ? `${varKeys[0]}:${(variants as Record<string, string>)[varKeys[0]!]}`
        : varKeys
            .toSorted()
            .map((k) => `${k}:${(variants as Record<string, string>)[k]}`)
            .join(";")

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
