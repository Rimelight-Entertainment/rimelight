import uiConfig from "virtual:rimelight/ui"
import { ICONS, svg } from "./icons.raw"

export { ICONS, svg }

const BUILTIN_ICONS = new Set(Object.keys(ICONS))

export const getSvgIcon = (k: string): string => {
  const path = (ICONS as Record<string, string>)[k]
  return path ? svg(path) : ""
}

export const DEFAULT_ICONS: Record<keyof typeof ICONS, string> = new Proxy({} as any, {
  get: (_, prop: string) => getSvgIcon(prop),
  has: (_, prop: string) => BUILTIN_ICONS.has(prop),
  ownKeys: () => Reflect.ownKeys(ICONS),
  getOwnPropertyDescriptor: (_, prop) => ({
    value: getSvgIcon(prop as string),
    enumerable: true,
    configurable: true
  })
})

export type RimelightIcons = Partial<Record<keyof typeof ICONS | (string & {}), string>>

const EMPTY_ICON = { isClass: false, content: "" }
const cache = new Map<string, { isClass: boolean; content: string }>()

export const resolveIcon = (name = "", custom?: string) => {
  if (!name) return EMPTY_ICON
  const raw = custom || uiConfig?.icons?.[name] || name
  let res = cache.get(raw)
  if (!res) {
    const path = (ICONS as Record<string, string>)[raw]
    res =
      typeof path === "string"
        ? { isClass: false, content: svg(path) }
        : raw.startsWith("i-") || raw.includes(":")
          ? { isClass: true, content: raw }
          : {
              isClass: false,
              content: raw.startsWith("<svg") ? raw : raw.startsWith("<") ? svg(raw) : ""
            }
    cache.set(raw, res)
  }
  return res
}
