import uiConfig from "virtual:rimelight/ui"
import type { ClassValue, ThemeConfig } from "./types"

export function cx(...args: ClassValue[]): string {
  let str = ""
  for (let i = 0; i < args.length; i++) {
    const val = args[i]
    if (!val) continue
    if (typeof val === "string" || typeof val === "number") {
      str += (str ? " " : "") + val
    } else if (Array.isArray(val)) {
      if (val.length) {
        const inner = cx(...val)
        if (inner) str += (str ? " " : "") + inner
      }
    } else if (typeof val === "object") {
      for (const k in val) {
        if (val[k]) str += (str ? " " : "") + k
      }
    }
  }
  return str
}

export function defineTheme<const S extends string>(name: string, themeConfig: ThemeConfig<S>) {
  const custom = uiConfig?.components?.themes?.[name]
  const slots = (custom?.slots ?? themeConfig.slots ?? ["root" as S]) as readonly S[]
  const rootSlot = (slots.includes("root" as S) ? "root" : slots[0] || "root") as S

  if (uiConfig?.unstyled) {
    return (props: any = {}): Record<S, string> => {
      const res = {} as Record<S, string>
      const hasClass = props.class || props.className
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i]!
        const base = slot === rootSlot && hasClass ? cx(props.class, props.className) : ""
        const fn = props.ui?.[slot]
        res[slot] = typeof fn === "function" ? fn(base) : cx(base, fn)
      }
      return res
    }
  }

  const autoColor = (custom?.variants ?? themeConfig.variants)?.color === "auto"
  const defaultVariants = { ...themeConfig.defaultVariants, ...custom?.defaultVariants }
  const compoundVariants = [
    ...(themeConfig.compoundVariants ?? []),
    ...(custom?.compoundVariants ?? [])
  ]

  const compiledCV = compoundVariants.map((cv) => {
    const { classNames, class: cls, ...rest } = cv
    const matchers: Array<{ key: string; exp: any }> = []
    for (const k in rest) {
      matchers.push({ key: k, exp: rest[k] })
    }
    return { matchers, cls: classNames || cls }
  })

  const baseMap: Record<string, string> = {}
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i]!
    baseMap[s] = cx(themeConfig.base?.[s], custom?.base?.[s])
  }

  const variants: Record<string, Record<string, any>> = { ...themeConfig.variants }
  if (custom?.variants) {
    for (const k in custom.variants) variants[k] = { ...variants[k], ...custom.variants[k] }
  }

  const variantKeys = Object.keys(variants).filter((k) => !(k === "color" && autoColor))

  return (props: any = {}): Record<S, string> => {
    const res = {} as Record<S, string>
    for (let i = 0; i < slots.length; i++) {
      res[slots[i]!] = baseMap[slots[i]!] || ""
    }

    const values = { ...defaultVariants, ...props }
    const color = autoColor ? (props.color ?? defaultVariants.color) : undefined

    for (let k = 0; k < variantKeys.length; k++) {
      const key = variantKeys[k]!
      const selected = values[key]
      if (selected != null && variants[key]?.[selected]) {
        const layer = variants[key][selected]
        for (let i = 0; i < slots.length; i++) {
          const s = slots[i]!
          const l = layer[s]
          if (l) res[s] = res[s] ? `${res[s]} ${cx(l)}` : cx(l)
        }
      }
    }

    if (compiledCV.length) {
      for (let c = 0; c < compiledCV.length; c++) {
        const { matchers, cls } = compiledCV[c]!
        if (!cls) continue
        let match = true
        for (let m = 0; m < matchers.length; m++) {
          const { key, exp } = matchers[m]!
          const actual = values[key]
          if (Array.isArray(exp) ? !exp.includes(actual) : actual !== exp) {
            match = false
            break
          }
        }
        if (match) {
          for (let i = 0; i < slots.length; i++) {
            const s = slots[i]!
            const l = cls[s]
            if (l) res[s] = res[s] ? `${res[s]} ${cx(l)}` : cx(l)
          }
        }
      }
    }

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i]!
      let slotClass = res[slot]!
      if (slot === rootSlot) {
        if (color) slotClass = slotClass ? `${slotClass} rl-color-${color}` : `rl-color-${color}`
        const extra = cx(props.class, props.className)
        if (extra) slotClass = slotClass ? `${slotClass} ${extra}` : extra
      }
      const override = props.ui?.[slot]
      res[slot] = typeof override === "function" ? override(slotClass) : cx(slotClass, override)
    }

    return res
  }
}
