import { scv, cx } from "css-variants"
import type { UIConfig } from "../types"

export const uiConfig: UIConfig = import.meta.env?.RIMELIGHT_UI_CONFIG || {}

export const defineTheme = <const S extends string>(
  name: string,
  theme: { slots: readonly S[]; [k: string]: any }
) => {
  const root = (theme.slots.includes("root" as S) ? "root" : theme.slots[0] || "root") as S
  if (uiConfig.unstyled)
    return (p: any = {}) => ({ [root]: cx(p.class, p.className) }) as Record<S, string>

  const auto = theme.variants?.color === "auto"
  const fn = scv(auto ? { ...theme, variants: { ...theme.variants, color: {} } } : (theme as any))
  const globalUi = uiConfig.components?.themes?.[name]?.slots

  return (props: any = {}): Record<S, string> => {
    const out = fn(props) as Record<string, string>
    const col = auto && (props.color ?? theme.defaultVariants?.color)
    if (col) out[root] = cx(out[root], `rl-color-${col}`)
    if (props.ui || globalUi) {
      for (const [k, f] of Object.entries({ ...globalUi, ...props.ui })) {
        if (f) out[k] = typeof f === "function" ? cx(f(out[k] || "")) : cx(out[k], f)
      }
    }
    if (props.class || props.className) out[root] = cx(out[root], props.class, props.className)
    return out as Record<S, string>
  }
}
