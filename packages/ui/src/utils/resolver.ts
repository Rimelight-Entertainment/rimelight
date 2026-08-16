import { scv, cx } from "css-variants"
import { colorNames, type ThemeColor, type UIConfig } from "../types"

export const uiConfig: Partial<UIConfig> & {
  [key: string]: unknown
} = (import.meta as any).env?.RIMELIGHT_UI_CONFIG ?? {}

const allColors = uiConfig.colors
  ? [...new Set<string>([...colorNames, ...Object.keys(uiConfig.colors)])]
  : colorNames

export const defineTheme = <const S extends string, const V extends Record<string, any>>(
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
  if (uiConfig.unstyled) {
    return (p?: Record<string, any>) => {
      const c = p?.class ?? p?.className
      return (c ? { root: String(c) } : {}) as Record<S, string>
    }
  }

  const variants: Record<string, any> = {}
  for (const k in theme.variants) {
    const val = theme.variants[k]
    if (val === "auto") {
      const slot = (theme.slots.includes("root" as S) ? "root" : theme.slots[0]) ?? "root"
      variants[k] = Object.fromEntries(
        allColors.map((c) => [c, { [slot]: c === "neutral" ? "" : `rl-color-${c}` }])
      )
    } else if (val) variants[k] = val
  }

  const themeFn = (scv as any)({
    ...theme,
    variants
  }) as (v: Record<string, any>) => Record<S, string>
  const globalSlots = uiConfig.components?.themes?.[name]?.slots
  const cache = new Map<string, Record<string, string>>()

  return (props?: Record<string, any>): Record<S, string> => {
    const { ui, class: c1, className: c2, ...v } = props ?? {}
    const rootClass = c1 ?? c2

    let key = ""
    for (const k in v) key += `${k}:${v[k]};`

    let res = cache.get(key)
    if (!res) cache.set(key, (res = themeFn(v)))

    const resolvedUi = globalSlots || ui ? { ...globalSlots, ...ui } : undefined
    if (!resolvedUi && !rootClass) return res

    const out: Record<string, string> = { ...res }
    for (const s in resolvedUi) {
      const o = resolvedUi[s]
      if (o) out[s] = typeof o === "function" ? cx(o(out[s] ?? "")) : cx(out[s], o)
    }
    if (rootClass) out.root = cx(out.root, rootClass)
    return out
  }
}
