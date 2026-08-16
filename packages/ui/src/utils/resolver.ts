import { scv, cx } from "css-variants"
import type { UIConfig } from "../types"

export const uiConfig: UIConfig = import.meta.env?.RIMELIGHT_UI_CONFIG || {}

export const defineTheme = <const S extends string>(
  name: string,
  t: { slots: readonly S[]; [k: string]: any }
) => {
  const root = (t.slots.find((s) => s === "root") ?? t.slots[0]) as S,
    auto = t.variants?.color === "auto",
    fn = scv(auto ? { ...t, variants: { ...t.variants, color: {} } } : (t as any)),
    g = uiConfig.components?.themes?.[name]?.slots

  return (p: any = {}): Record<S, string> => {
    if (uiConfig.unstyled) return { [root]: cx(p.class, p.className) } as any
    const out: any = fn(p),
      c = auto && (p.color ?? t.defaultVariants?.color)
    out[root] = cx(out[root], c && `rl-color-${c}`, p.class, p.className)
    for (const [k, f] of Object.entries({ ...g, ...p.ui }))
      if (f) out[k] = typeof f === "function" ? cx(f(out[k] || "")) : cx(out[k], f)
    return out
  }
}
