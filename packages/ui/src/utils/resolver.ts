import { scv, cx, type SlotClassVariantDefinition, type SlotClassVariantRecord } from "css-variants"
import { colorNames, uiConfig, type Override, type ThemeColor } from "../config"

const colors = uiConfig.colors ?? colorNames

const autoColorVariants: Record<string, { root: string }> = {
  neutral: { root: "" }
}
for (const c of colors) {
  autoColorVariants[c] = { root: `rl-color-${c}` }
}

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

export type ThemeVariants<S extends string> = Record<
  string,
  "auto" | Record<string, Partial<Record<S, string>>>
>

export type ThemeDefaultVariants<V> = {
  [K in keyof V]?: V[K] extends "auto" ? ThemeColor : keyof V[K] | boolean | string
}

export interface CustomThemeDefinition<S extends string, V extends ThemeVariants<S>> {
  slots: readonly S[] | S[]
  base?: Partial<Record<S, string | string[]>>
  variants?: V
  compoundVariants?: Array<Record<string, unknown> & { classNames?: Partial<Record<S, string>> }>
  defaultVariants?: ThemeDefaultVariants<V>
}

export const defineTheme = <
  const S extends string,
  const V extends ThemeVariants<S> = ThemeVariants<S>
>(
  name: string,
  theme: CustomThemeDefinition<S, V>
) => {
  const normalizedVariants: Record<string, unknown> = {}
  if (theme.variants) {
    for (const key of Object.keys(theme.variants)) {
      const val = theme.variants[key]
      if (val === "auto") {
        const slot = (theme.slots as readonly string[]).includes("root")
          ? "root"
          : (theme.slots[0] ?? "root")
        normalizedVariants[key] =
          slot === "root"
            ? autoColorVariants
            : {
                neutral: { [slot]: "" },
                ...Object.fromEntries(colors.map((c) => [c, { [slot]: `rl-color-${c}` }]))
              }
      } else if (val && typeof val === "object") {
        normalizedVariants[key] = val
      }
    }
  }

  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const themeFn = scv({
    slots: theme.slots,
    base: theme.base,
    variants: normalizedVariants,
    compoundVariants: theme.compoundVariants,
    defaultVariants: theme.defaultVariants
  } as unknown as SlotClassVariantDefinition<S, SlotClassVariantRecord<S>>)

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
