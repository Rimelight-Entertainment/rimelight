import { scv, cx } from "css-variants"
import type { ThemeColor, UIConfig } from "../types"

export const uiConfig = (import.meta.env?.RIMELIGHT_UI_CONFIG ?? {}) as Partial<UIConfig> &
  Record<string, unknown>

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
  const slot = (theme.slots.includes("root" as S) ? "root" : (theme.slots[0] ?? "root")) as S

  if (uiConfig.unstyled) {
    return (p: any = {}) => ({ [slot]: cx(p.class, p.className) }) as Record<S, string>
  }

  const auto = theme.variants?.color === "auto"
  const themeFn = scv(
    (auto ? { ...theme, variants: { ...theme.variants, color: {} } } : theme) as any
  )
  const globalUi = uiConfig.components?.themes?.[name]?.slots

  return (props: any = {}): Record<S, string> => {
    const { ui, class: c1, className: c2, ...v } = props
    const out = themeFn(v) as Record<S, string>
    const color = auto && (v.color ?? (theme.defaultVariants as any)?.color)
    if (color) out[slot] = cx(out[slot], `rl-color-${color}`)

    const merged = globalUi || ui ? { ...globalUi, ...ui } : null
    if (merged) {
      for (const k in merged) {
        const fn = merged[k]
        if (fn)
          (out as any)[k] =
            typeof fn === "function" ? cx(fn((out as any)[k] ?? "")) : cx((out as any)[k], fn)
      }
    }
    if (c1 || c2) out[slot] = cx(out[slot], c1, c2)
    return out
  }
}
