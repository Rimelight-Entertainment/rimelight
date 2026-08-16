import { scv, cx } from "css-variants"
import type { UIConfig } from "../types"

export const uiConfig: UIConfig = import.meta.env?.RIMELIGHT_UI_CONFIG || {}

export const defineTheme = <const S extends string>(
  name: string,
  theme: { slots: readonly S[]; [k: string]: any }
) => {
  const root = (theme.slots.find((s) => s === "root") ?? theme.slots[0]) as S,
    auto = theme.variants?.color === "auto",
    fn = scv(auto ? { ...theme, variants: { ...theme.variants, color: {} } } : (theme as any)),
    gUi = uiConfig.components?.themes?.[name]?.slots

  return (p: any = {}): Record<S, string> => {
    if (uiConfig.unstyled) return { [root]: cx(p.class, p.className) } as any
    const out: any = fn(p),
      c = auto && (p.color ?? theme.defaultVariants?.color)
    out[root] = cx(out[root], c && `rl-color-${c}`, p.class, p.className)
    for (const [k, f] of Object.entries({ ...gUi, ...p.ui }))
      if (f) out[k] = typeof f === "function" ? cx(f(out[k] || "")) : cx(out[k], f)
    return out
  }
}
