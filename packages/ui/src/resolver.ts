import "virtual:uno.css"
import { scv, cx } from "css-variants"
import uiConfig from "virtual:rimelight/ui"

export const defineTheme = <const S extends string>(name: string, theme: any) => {
  const custom = uiConfig.components?.themes?.[name],
    merged = custom
      ? { ...theme, ...custom, variants: { ...theme.variants, ...custom.variants } }
      : theme,
    root = (merged.slots.includes("root") ? "root" : merged.slots[0]) as S,
    autoColor = merged.variants?.color === "auto",
    scvFn = scv(autoColor ? { ...merged, variants: { ...merged.variants, color: {} } } : merged)

  return (props: any = {}): Record<S, string> => {
    if (uiConfig.unstyled) return { [root]: cx(props.class, props.className) } as any
    const slots = scvFn(props),
      color = autoColor && (props.color ?? merged.defaultVariants?.color)
    slots[root] = cx(slots[root], color && `rl-color-${color}`, props.class, props.className)
    for (const [k, v] of Object.entries(props.ui ?? {}))
      slots[k] = cx(slots[k], typeof v === "function" ? (v as any)(slots[k] || "") : v)
    return slots
  }
}
