import { scv, cx } from "css-variants"
import uiConfig from "virtual:rimelight/ui"

export function defineTheme<const S extends string>(name: string, theme: any) {
  const custom = uiConfig?.components?.themes?.[name]
  const merged = custom
    ? {
        ...theme,
        ...custom,
        base: { ...theme.base, ...custom.base },
        variants: { ...theme.variants, ...custom.variants }
      }
    : theme
  const root = merged.slots?.includes("root") ? "root" : merged.slots?.[0] || "root"
  const autoColor = merged.variants?.color === "auto"
  const resolve = scv(
    autoColor ? { ...merged, variants: { ...merged.variants, color: undefined } } : merged
  )

  return (props: any = {}): Record<S, string> => {
    if (uiConfig?.unstyled)
      return Object.fromEntries((merged.slots ?? ["root"]).map((s: string) => [s, ""])) as Record<
        S,
        string
      >
    const slots = resolve(props)
    const color = autoColor && (props.color ?? merged.defaultVariants?.color)
    slots[root] = cx(slots[root], color && `rl-color-${color}`, props.class, props.className)
    if (props.ui) {
      for (const k in props.ui) {
        const v = props.ui[k]
        slots[k] = cx(slots[k], typeof v === "function" ? v(slots[k] || "") : v)
      }
    }
    return slots as Record<S, string>
  }
}
