import { scv, cx } from "css-variants"
import type { UIConfig } from "../types"

export const uiConfig: UIConfig = import.meta.env?.RIMELIGHT_UI_CONFIG || {}

export const defineTheme = <const S extends string>(name: string, t: any) => {
  const root = (t.slots.includes("root") ? "root" : t.slots[0]) as S,
    auto = t.variants?.color === "auto",
    fn = scv(auto ? { ...t, variants: { ...t.variants, color: {} } } : t),
    g = uiConfig.components?.themes?.[name]?.slots

  return (p: any = {}): Record<S, string> => {
    if (uiConfig.unstyled) return { [root]: cx(p.class, p.className) } as any
    const r = fn(p),
      c = auto && (p.color ?? t.defaultVariants?.color),
      u = { ...g, ...p.ui }
    r[root] = cx(r[root], c && `rl-color-${c}`, p.class, p.className)
    for (const k in u)
      if (u[k]) r[k] = cx(typeof u[k] === "function" ? u[k](r[k] || "") : [r[k], u[k]])
    return r
  }
}
