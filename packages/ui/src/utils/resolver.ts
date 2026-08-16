import { scv, cx } from "css-variants"
import type { UIConfig } from "../types"

export const uiConfig: UIConfig = import.meta.env?.RIMELIGHT_UI_CONFIG || {}

export const defineTheme = <const S extends string>(
  name: string,
  theme: { slots: readonly S[]; [k: string]: any }
): ((props?: Record<string, any>) => Record<S, string>) => {
  const root = (theme.slots.includes("root" as any) ? "root" : theme.slots[0]) as S
  if (uiConfig.unstyled) return (p = {}) => ({ [root]: cx(p.class, p.className) }) as any

  const auto = theme.variants?.color === "auto"
  const fn = scv(auto ? { ...theme, variants: { ...theme.variants, color: {} } } : (theme as any))
  const gUi = uiConfig.components?.themes?.[name]?.slots

  return (p = {}) => {
    const out: any = fn(p)
    const col = auto && (p.color ?? theme.defaultVariants?.color)
    if (col || p.class || p.className)
      out[root] = cx(out[root], col && `rl-color-${col}`, p.class, p.className)
    if (p.ui || gUi)
      for (const [k, f] of Object.entries({ ...gUi, ...p.ui }))
        if (f) out[k] = typeof f === "function" ? cx(f(out[k] || "")) : cx(out[k], f)
    return out
  }
}
