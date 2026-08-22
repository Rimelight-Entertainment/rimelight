import "virtual:uno.css"
import { scv, cx } from "css-variants"
import type { UIConfig } from "./types"

export const uiConfig: UIConfig = import.meta.env.RIMELIGHT_UI_CONFIG ?? {}

export const defineTheme = <const S extends string>(name: string, theme: any) => {
  const root = (theme.slots.includes("root") ? "root" : theme.slots[0]) as S,
    autoColor = theme.variants?.color === "auto",
    scvFn = scv(autoColor ? { ...theme, variants: { ...theme.variants, color: {} } } : theme),
    globalSlots = uiConfig.components?.themes?.[name]?.slots
  return (props: any = {}): Record<S, string> => {
    if (uiConfig.unstyled) return { [root]: cx(props.class, props.className) } as any
    const slots = scvFn(props),
      color = autoColor && (props.color ?? theme.defaultVariants?.color)
    slots[root] = cx(slots[root], color && `rl-color-${color}`, props.class, props.className)
    for (const [k, v] of Object.entries({ ...globalSlots, ...props.ui }))
      slots[k] = cx(slots[k], typeof v === "function" ? v(slots[k] || "") : v)
    return slots
  }
}
