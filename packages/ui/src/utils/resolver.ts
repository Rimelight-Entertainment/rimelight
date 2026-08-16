import { scv, cx } from "css-variants"
import { colorNames, type ThemeColor } from "../types"

export type ResolvedUIConfig = {
  unstyled?: boolean
  shortcuts?: Record<string, unknown>
  logos?: Record<string, unknown>
  icons?: Record<string, string>
  colors?: readonly string[]
  themes?: Record<string, { slots?: Record<string, string | ((b: string) => string)> }>
  [key: string]: unknown
}

export const uiConfig: ResolvedUIConfig = import.meta.env?.RIMELIGHT_UI_CONFIG ?? {}

declare global {
  interface ImportMetaEnv {
    readonly RIMELIGHT_UI_CONFIG?: ResolvedUIConfig
  }
}

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
    return (p?: Record<string, any>) =>
      (p?.class || p?.className ? { root: (p.class ?? p.className) as string } : {}) as Record<
        S,
        string
      >
  }

  const variants: Record<string, any> = {}
  for (const k in theme.variants) {
    const val = theme.variants[k]
    if (val === "auto") {
      const slot = (theme.slots as readonly string[]).includes("root")
        ? "root"
        : (theme.slots[0] ?? "root")
      const auto: Record<string, Record<string, string>> = { neutral: { [slot]: "" } }
      for (const c of uiConfig.colors ?? colorNames) auto[c] = { [slot]: `rl-color-${c}` }
      variants[k] = auto
    } else if (val) {
      variants[k] = val
    }
  }

  const themeFn = (scv as unknown as (c: unknown) => (v: Record<string, any>) => Record<S, string>)(
    { ...theme, slots: [...theme.slots], variants }
  )
  const globalSlots = uiConfig.themes?.[name]?.slots
  const cache = new Map<string, Record<string, string>>()

  return (props?: Record<string, any>): Record<S, string> => {
    const rc = props?.class ?? props?.className
    const rootClass = typeof rc === "string" ? rc : undefined
    const { ui, class: _, className: __, ...v } = props ?? {}

    let key = ""
    for (const k in v) key += `${k}:${String(v[k])};`

    if (!cache.has(key)) cache.set(key, themeFn(v))
    const res = cache.get(key)!
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
