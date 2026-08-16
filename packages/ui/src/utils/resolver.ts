import { scv, cx } from "css-variants"
import type { ThemeColor, UIConfig } from "../types"

export const uiConfig: Partial<UIConfig> & Record<string, unknown> =
  (import.meta.env?.RIMELIGHT_UI_CONFIG as
    | (Partial<UIConfig> & Record<string, unknown>)
    | undefined) ?? {}

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
): ((props?: Record<string, any>) => Record<S, string>) => {
  if (uiConfig.unstyled) {
    return (p?: Record<string, any>) =>
      (p?.class || p?.className ? { root: String(p.class ?? p.className) } : {}) as Record<
        S,
        string
      >
  }

  const hasAuto = Object.values(theme.variants ?? {}).includes("auto")
  const defaultSlot = (theme.slots.includes("root" as S) ? "root" : (theme.slots[0] ?? "root")) as S

  const variants =
    theme.variants &&
    Object.fromEntries(Object.entries(theme.variants).map(([k, v]) => [k, v === "auto" ? {} : v]))

  const themeFn = (scv as any)({ ...theme, variants }) as (
    v: Record<string, any>
  ) => Record<S, string>
  const globalSlots = uiConfig.components?.themes?.[name]?.slots
  const cache = new Map<string, Record<string, string>>()

  return (props?: Record<string, any>): Record<S, string> => {
    const { ui, class: c1, className: c2, ...v } = props ?? {}
    const rootClass = c1 ?? c2
    const key = JSON.stringify(v)

    let res = cache.get(key)
    if (!res) cache.set(key, (res = themeFn(v)))

    const color = hasAuto && (v.color ?? (theme.defaultVariants as any)?.color)
    const colorClass = color && color !== "neutral" ? `rl-color-${color}` : ""
    const resolvedUi = globalSlots || ui ? { ...globalSlots, ...ui } : undefined

    if (!resolvedUi && !rootClass && !colorClass) return res

    const out: Record<string, string> = { ...res }
    if (colorClass) out[defaultSlot] = cx(out[defaultSlot], colorClass)
    if (resolvedUi) {
      for (const s in resolvedUi) {
        const o = resolvedUi[s]
        if (o) out[s as S] = typeof o === "function" ? cx(o(out[s as S] ?? "")) : cx(out[s as S], o)
      }
    }
    if (rootClass) out.root = cx(out.root, rootClass)
    return out
  }
}
