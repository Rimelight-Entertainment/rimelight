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

  if (uiConfig?.unstyled) {
    return (props: any = {}): Record<S, string> => {
      const res = {} as Record<S, string>
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i]!
        const base = slot === rootSlot ? cx(props.class, props.className) : ""
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

  const baseMap: Record<string, string> = {}
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i]!
    baseMap[s] = cx(themeConfig.base?.[s], custom?.base?.[s])
  }

  const variants: Record<string, Record<string, any>> = { ...themeConfig.variants }
  if (custom?.variants) {
    for (const k in custom.variants) variants[k] = { ...variants[k], ...custom.variants[k] }
  }

  return (props: any = {}): Record<S, string> => {
    const res = {} as Record<S, string>
    const values = { ...defaultVariants, ...props }
    const color = autoColor ? (props.color ?? defaultVariants.color) : undefined

    const activeLayers: Array<Record<string, any>> = []
    for (const k in variants) {
      if (k === "color" && autoColor) continue
      const selected = values[k]
      if (selected != null && variants[k]?.[selected]) {
        activeLayers.push(variants[k][selected])
      }
    }

    for (let c = 0; c < compoundVariants.length; c++) {
      const cv = compoundVariants[c]!
      let match = true
      for (const k in cv) {
        if (k === "classNames" || k === "class") continue
        const expected = cv[k]
        const actual = values[k]
        if (Array.isArray(expected) ? !expected.includes(actual) : actual !== expected) {
          match = false
          break
        }
      }
      if (match) {
        const cls = cv.classNames || cv.class
        if (cls) activeLayers.push(cls)
      }
    }

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i]!
      let cls = baseMap[slot] || ""

      for (let l = 0; l < activeLayers.length; l++) {
        const layerCls = activeLayers[l]![slot]
        if (layerCls) cls = cx(cls, layerCls)
      }

      if (slot === rootSlot) {
        cls = cx(cls, color && `rl-color-${color}`, props.class, props.className)
      }

      const override = props.ui?.[slot]
      res[slot] = typeof override === "function" ? override(cls) : cx(cls, override)
    }

    return res
  }
}
