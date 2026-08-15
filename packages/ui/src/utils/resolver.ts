import { scv, cx } from "css-variants"
import { colorNames, uiConfig, type Override, type ThemeColor } from "../config"

const colors = uiConfig.colors ?? colorNames
const cache = new WeakMap<object, Map<string, Record<string, string>>>()
const create = (fn: Function, arg: unknown): any => fn(arg)

const getUi = (name: string, prop?: Record<string, Override>) => {
  const global = uiConfig.themes?.[name]?.slots
  return global ? (prop ? { ...global, ...prop } : global) : prop
}

export const defineTheme = <
  const S extends string,
  const V extends Record<string, "auto" | Record<string, Partial<Record<S, string>>>> = Record<
    string,
    "auto" | Record<string, Partial<Record<S, string>>>
  >
>(
  name: string,
  theme: {
    slots: readonly S[]
    base?: Partial<Record<S, string | string[]>>
    variants?: V
    compoundVariants?: Array<Record<string, unknown> & { classNames?: Partial<Record<S, string>> }>
    defaultVariants?: {
      [K in keyof V]?: V[K] extends "auto" ? ThemeColor : keyof V[K] | boolean | string
    }
  }
) => {
  const variants: Record<string, unknown> = {}
  if (theme.variants) {
    for (const k in theme.variants) {
      const val = theme.variants[k]
      if (val === "auto") {
        const slot = (theme.slots as readonly string[]).includes("root")
          ? "root"
          : (theme.slots[0] ?? "root")
        const auto: Record<string, Record<string, string>> = { neutral: { [slot]: "" } }
        for (const c of colors) auto[c] = { [slot]: `rl-color-${c}` }
        variants[k] = auto
      } else if (val) {
        variants[k] = val
      }
    }
  }

  const config: Record<string, unknown> = { slots: [...theme.slots], variants }
  if (theme.base) config.base = theme.base
  if (theme.compoundVariants) config.compoundVariants = theme.compoundVariants
  if (theme.defaultVariants) config.defaultVariants = theme.defaultVariants
  const themeFn = create(scv, config)

  return (
    props?: Record<string, unknown> & {
      ui?: Record<string, Override>
      class?: string
      className?: string
    }
  ): Record<S, string> => {
    const rootClass =
      typeof props?.class === "string"
        ? props.class
        : typeof props?.className === "string"
          ? props.className
          : undefined

    if (uiConfig.unstyled) return create(() => (rootClass ? { root: rootClass } : {}), null)

    let map = cache.get(themeFn)
    if (!map) cache.set(themeFn, (map = new Map()))

    const { ui, class: _, className: __, ...v } = props ?? {}
    let key = ""
    for (const k in v) key += `${k}:${String(v[k])};`

    const res =
      map.get(key) ??
      create(() => {
        const r = themeFn(v)
        map?.set(key, r)
        return r
      }, null)

    const mergedUi = getUi(name, ui)
    if (!rootClass && !mergedUi) return res

    const out: Record<string, string> = { ...res }
    if (mergedUi) {
      for (const s in mergedUi) {
        const o = mergedUi[s]
        if (o) out[s] = typeof o === "function" ? cx(o(out[s] ?? "")) : cx(out[s], o)
      }
    }
    if (rootClass) out.root = cx(out.root, rootClass)
    return out
  }
}
