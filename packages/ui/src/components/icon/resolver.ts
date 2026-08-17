import { DEFAULT_ICONS } from "../../icons"
import { uiConfig } from "../../resolver"

export interface ResolvedIcon {
  isClass: boolean
  content: string
}

const c = new Map<string, ResolvedIcon>(),
  isCls = (s: string) => s.startsWith("i-") || s.includes(":")

export const resolveIcon = (k = "", custom?: string): ResolvedIcon => {
  if (!k) return { isClass: false, content: "" }
  const id = custom ? `${k}:${custom}` : k,
    cached = c.get(id)
  if (cached) return cached
  const raw = custom || uiConfig.icons?.[k] || k,
    res = isCls(raw)
      ? { isClass: true, content: raw }
      : { isClass: false, content: (DEFAULT_ICONS as any)[raw] || "" }
  c.set(id, res)
  return res
}
