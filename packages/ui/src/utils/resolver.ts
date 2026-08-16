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
  if (uiConfig.unstyled) {
    return (p?: any) =>
      (p?.class || p?.className ? { root: String(p.class ?? p.className) } : {}) as Record<
        S,
        string
      >
  }

  const slot = (theme.slots.includes("root" as S) ? "root" : (theme.slots[0] ?? "root")) as S
  const auto = theme.variants?.color === "auto"
  const themeFn = scv({
    ...theme,
    variants: auto ? { ...theme.variants, color: {} } : theme.variants
  } as any) as (v: any) => Record<string, string>
  const globalUi = uiConfig.components?.themes?.[name]?.slots

  return (props: any = {}): Record<S, string> => {
    const { ui, class: c1, className: c2, ...v } = props
    const out = themeFn(v)
    const color = auto && (v.color ?? (theme.defaultVariants as any)?.color)
    const mergedUi = globalUi && ui ? { ...globalUi, ...ui } : globalUi || ui

    if (color && color !== "neutral") out[slot] = cx(out[slot], `rl-color-${color}`)
    if (mergedUi) {
      for (const k in mergedUi) {
        const fn = mergedUi[k]
        if (fn) {
          out[k] = typeof fn === "function" ? cx(fn(out[k] ?? "")) : cx(out[k], fn)
        }
      }
    }
    if (c1 || c2) out.root = cx(out.root, c1 ?? c2)
    return out as Record<S, string>
  }
}
