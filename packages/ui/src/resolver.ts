import uiConfig from "virtual:rimelight/ui"

export type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | { [key: string]: any }
  | ClassValue[]

export function cx(...args: ClassValue[]): string {
  let str = ""
  for (let i = 0; i < args.length; i++) {
    const val = args[i]
    if (!val) continue
    if (typeof val === "string" || typeof val === "number") {
      str += (str ? " " : "") + val
    } else if (Array.isArray(val)) {
      const inner = cx(...val)
      if (inner) str += (str ? " " : "") + inner
    } else if (typeof val === "object") {
      for (const k in val) {
        if (val[k]) str += (str ? " " : "") + k
      }
    }
  }
  return str
}

export interface ThemeConfig<S extends string = string> {
  slots?: readonly S[] | S[]
  base?: Partial<Record<S, ClassValue>>
  variants?: Record<string, any>
  compoundVariants?: Array<
    Record<string, any> & {
      classNames?: Partial<Record<S, ClassValue>>
      class?: Partial<Record<S, ClassValue>>
    }
  >
  defaultVariants?: Record<string, any>
}

export function defineTheme<const S extends string>(name: string, themeConfig: ThemeConfig<S>) {
  const custom = uiConfig?.components?.themes?.[name]
  const slots = (custom?.slots ?? themeConfig.slots ?? ["root" as S]) as readonly S[]
  const rootSlot = (slots.includes("root" as S) ? "root" : slots[0] || "root") as S
  const autoColor = (custom?.variants ?? themeConfig.variants)?.color === "auto"

  if (uiConfig?.unstyled) {
    const empty = Object.fromEntries(slots.map((s) => [s, ""])) as Record<S, string>
    return (): Record<S, string> => empty
  }

  const baseMap = { ...themeConfig.base, ...custom?.base } as Record<string, ClassValue | undefined>
  const variants: Record<string, Record<string, Record<string, ClassValue>>> = {
    ...themeConfig.variants
  }
  if (custom?.variants) {
    for (const k in custom.variants) {
      variants[k] = { ...variants[k], ...custom.variants[k] }
    }
  }
  const compoundVariants = [
    ...(themeConfig.compoundVariants ?? []),
    ...(custom?.compoundVariants ?? [])
  ]
  const defaultVariants = { ...themeConfig.defaultVariants, ...custom?.defaultVariants }

  return (props: any = {}): Record<S, string> => {
    const res = {} as Record<S, string>
    const values = { ...defaultVariants, ...props }
    const color = autoColor ? (props.color ?? defaultVariants.color) : undefined

    const activeCompounds: Array<Record<string, ClassValue>> = []
    if (compoundVariants.length) {
      for (let c = 0; c < compoundVariants.length; c++) {
        const cv = compoundVariants[c]!
        let match = true
        for (const key in cv) {
          if (key === "classNames" || key === "class") continue
          const expected = cv[key]
          const actual = values[key]
          if (Array.isArray(expected) ? !expected.includes(actual) : actual !== expected) {
            match = false
            break
          }
        }
        if (match) {
          const cvClasses = cv.classNames || cv.class
          if (cvClasses) activeCompounds.push(cvClasses)
        }
      }
    }

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i]!
      let slotClass = cx(baseMap[slot])

      for (const variantKey in variants) {
        if (variantKey === "color" && autoColor) continue
        const selected = values[variantKey]
        if (selected != null && variants[variantKey]?.[selected]?.[slot]) {
          slotClass = cx(slotClass, variants[variantKey][selected][slot])
        }
      }

      for (let c = 0; c < activeCompounds.length; c++) {
        const cls = activeCompounds[c]![slot]
        if (cls) slotClass = cx(slotClass, cls)
      }

      if (slot === rootSlot) {
        slotClass = cx(slotClass, color && `rl-color-${color}`, props.class, props.className)
      }

      if (props.ui?.[slot]) {
        const override = props.ui[slot]
        slotClass = typeof override === "function" ? override(slotClass) : cx(slotClass, override)
      }

      res[slot] = slotClass
    }

    return res
  }
}
