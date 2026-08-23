import uiConfig from "virtual:rimelight/ui"
import { getIconSvg, ICONS, svg } from "./icons.raw"

export { ICONS, svg }

export const getSvgIcon = (k: string): string => getIconSvg(k) ?? ""

export const DEFAULT_ICONS: Record<keyof typeof ICONS, string> = Object.fromEntries(
  Object.keys(ICONS).map((k) => [k, getSvgIcon(k)])
) as Record<keyof typeof ICONS, string>

export type RimelightIcons = Partial<Record<keyof typeof ICONS | (string & {}), string>>

const EMPTY_ICON = { isClass: false, content: "" }
const cache = new Map<string, { isClass: boolean; content: string }>()

export const resolveIcon = (name = "", custom?: string) => {
  if (!name) return EMPTY_ICON
  const raw = custom || uiConfig?.icons?.[name] || name
  let res = cache.get(raw)
  if (!res) {
    const content = getIconSvg(raw)
    res =
      content !== undefined
        ? { isClass: false, content }
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
