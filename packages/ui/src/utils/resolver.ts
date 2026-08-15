import { cx, type SlotClassVariantDefinition, type SlotClassVariantRecord } from "css-variants"
import { uiConfig, type Override } from "../config"

export const defineTheme = <
  const S extends string,
  const T extends SlotClassVariantRecord<S> | undefined
>(
  theme: SlotClassVariantDefinition<S, T>
) => theme

const classCache = new WeakMap<(...args: any[]) => any, Map<string, Record<string, string>>>()
const EMPTY: Record<string, Override> = Object.freeze({})

export const useUi = (name: string, prop?: Record<string, Override>): Record<string, Override> => {
  const global = uiConfig.themes?.[name]?.slots
  return global ? (prop ? { ...global, ...prop } : global) : (prop ?? EMPTY)
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
    const v = variants as Record<string, unknown>
    for (const k in v) {
      key += `${k}:${String(v[k])};`
    }
  }

  let cached = map.get(key)
  if (!cached) map.set(key, (cached = themeFn(variants)))

  let hasUi = false
  if (ui !== EMPTY) {
    for (const _ in ui) {
      hasUi = true
      break
    }
  }

  if (!rootClass && !hasUi) return cached

  const res: Record<string, string> = { ...cached }
  if (hasUi) {
    for (const slot in ui) {
      const o = ui[slot]
      if (o) res[slot] = typeof o === "function" ? cx(o(res[slot] ?? "")) : cx(res[slot], o)
    }
  }
  if (rootClass) res.root = cx(res.root, rootClass)
  return res
}
