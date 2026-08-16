import { scv, cx } from "css-variants"
import type { ThemeColor, UIConfig } from "../types"

export const uiConfig = (import.meta.env?.RIMELIGHT_UI_CONFIG ?? {}) as Partial<UIConfig> &
  Record<string, unknown>

export type ThemeProps<S extends string, V extends Record<string, any>> = {
  [K in keyof V]?: (V[K] extends "auto" ? ThemeColor : keyof V[K] | boolean | string) | undefined
} & {
  class?: string | undefined
  className?: string | undefined
  ui?: Partial<Record<S, string | ((base: string) => string) | undefined>> | undefined
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
): ((props?: (ThemeProps<S, V> & Record<string, any>) | null) => Record<S, string>) => {
  const root = (theme.slots.includes("root" as S) ? "root" : (theme.slots[0] ?? "root")) as S
  if (uiConfig.unstyled)
    return (p: any = {}) => ({ [root]: cx(p?.class, p?.className) }) as Record<S, string>

  const auto = theme.variants?.color === "auto"
  const fn = scv(auto ? { ...theme, variants: { ...theme.variants, color: {} } } : (theme as any))
  const globalUi = uiConfig.components?.themes?.[name]?.slots

  return (props: any = {}): Record<S, string> => {
    const { ui, class: c1, className: c2, ...v } = props ?? {}
    const out = fn(v) as Record<string, string>
    const color = auto && (v.color ?? (theme.defaultVariants as any)?.color)
    if (color) out[root] = cx(out[root], `rl-color-${color}`)

    const merged = ui && globalUi ? { ...globalUi, ...ui } : (ui ?? globalUi)
    if (merged) {
      for (const [k, f] of Object.entries(merged)) {
        if (f) out[k] = typeof f === "function" ? cx((f as Function)(out[k] ?? "")) : cx(out[k], f)
      }
    }
    if (c1 || c2) out[root] = cx(out[root], c1, c2)
    return out as Record<S, string>
  }
}
