import { scv, cx, type SlotClassVariantDefinition, type SlotClassVariantRecord } from "css-variants"
import { uiConfig, type Override } from "../config"

const classCache = new WeakMap<(...args: any[]) => any, Map<string, Record<string, string>>>()
const EMPTY: Record<string, Override> = Object.freeze({})

export const useUi = (name: string, prop?: Record<string, Override>): Record<string, Override> => {
  if (!name) return prop ?? EMPTY
  const global = uiConfig.themes?.[name]?.slots
  return global ? (prop ? { ...global, ...prop } : global) : (prop ?? EMPTY)
}

export function resolveClasses<T extends (...args: any[]) => Record<string, string>>(
  themeFn: T,
  variants?: Parameters<T>[0] | Record<string, unknown>,
  ui: Record<string, Override> = EMPTY,
  rootClass?: string
): Record<string, string> {
  if (uiConfig.unstyled) return rootClass ? { root: rootClass } : {}

  let map = classCache.get(themeFn)
  if (!map) classCache.set(themeFn, (map = new Map()))

  let key = ""
  if (variants && typeof variants === "object") {
    for (const k in variants) {
      key += `${k}:${String((variants as Record<string, unknown>)[k])};`
    }
  }

  let cached = map.get(key)
  if (!cached) {
    cached = themeFn(variants)
    map.set(key, cached)
  }

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

export const defineTheme = <
  const S extends string,
  const T extends SlotClassVariantRecord<S> | undefined
>(
  name: string,
  theme: SlotClassVariantDefinition<S, T>
) => {
  const themeFn = scv(theme)

  return (
    props?: Record<string, unknown> & {
      ui?: Record<string, Override>
      class?: string
      className?: string
    }
  ): Record<S, string> => {
    if (!props) {
      return resolveClasses(themeFn, undefined, useUi(name), undefined)
    }
    const { ui, class: rootClass, className, ...variants } = props
    const cls =
      typeof rootClass === "string"
        ? rootClass
        : typeof className === "string"
          ? className
          : undefined
    return resolveClasses(themeFn, variants, useUi(name, ui), cls)
  }
}
