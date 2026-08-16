import { DEFAULT_ICONS } from "../../icons/defaults"
import { uiConfig } from "../../utils/resolver"

export interface ResolvedIcon {
  isClass: boolean
  content: string
}

const c = new Map<string, ResolvedIcon>(),
  isCls = (s: string) => s.startsWith("i-") || s.includes(":")

export function resolveIcon(k = "", custom?: string): ResolvedIcon {
  if (!k) return { isClass: false, content: "" }
  if (isCls(k)) return { isClass: true, content: k }
  const id = custom ? `${k}:${custom}` : k,
    cached = c.get(id)
  if (cached) return cached
  const raw = custom || uiConfig.icons?.[k],
    res: ResolvedIcon = raw
      ? { isClass: isCls(raw), content: raw }
      : { isClass: false, content: (DEFAULT_ICONS as Record<string, string>)[k] || "" }
  c.set(id, res)
  return res
}
