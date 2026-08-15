import { cx } from "css-variants"
import { uiConfig, type Override } from "../config"

const classCache = new WeakMap<(...args: any[]) => any, Map<string, Record<string, string>>>()
const themeCreatorCache = new WeakMap<Function>()
const EMPTY: Record<string, Override> = Object.freeze({})

export const useUi = (name: string, prop?: Record<string, Override>): Record<string, Override> =>
  uiConfig.themes?.[name]?.slots && prop
    ? { ...uiConfig.themes[name].slots, ...prop }
    : (uiConfig.themes?.[name]?.slots ?? prop ?? EMPTY)

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

  const varEntries = variants ? Object.entries(variants) : []
  const len = varEntries.length
  const key =
    len === 0
      ? ""
      : len === 1
        ? `${varEntries[0]![0]}:${String(varEntries[0]![1])}`
        : varEntries
            .toSorted(([a], [b]) => (a < b ? -1 : 1))
            .map(([k, v]) => `${k}:${String(v)}`)
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
