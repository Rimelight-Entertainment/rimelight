import { atom } from "./stores"

export type Handler = (e: KeyboardEvent) => void
export interface ShortcutConfig {
  handler: Handler
  usingInput?: boolean | string | undefined
  label?: string | undefined
  description?: string | undefined
  category?: string | undefined
  order?: number | undefined
}
export type ShortcutsConfig = Record<string, ShortcutConfig | Handler | false | null | undefined>
export interface ShortcutsOptions {
  chainDelay?: number | undefined
}
export interface RegisteredShortcut {
  id: string
  keys: string[]
  label?: string | undefined
  description?: string | undefined
  category?: string | undefined
  order?: number | undefined
}

interface Shortcut {
  handler: Handler
  usingInput?: boolean | string | undefined
}

const isMac = typeof navigator !== "undefined" && /Mac|iP/.test(navigator.userAgent),
  KEYS: Record<string, string> = {
    ctrl: "Ctrl",
    meta: isMac ? "⌘" : "Ctrl",
    alt: isMac ? "⌥" : "Alt",
    shift: isMac ? "⇧" : "Shift",
    enter: "↵",
    delete: "⌦",
    backspace: "⌫",
    escape: "Esc",
    tab: "⇥",
    space: "Space",
    arrowup: "↑",
    arrowdown: "↓",
    arrowleft: "←",
    arrowright: "→"
  }

const MODS: Record<string, string> = {
  cmd: "meta",
  command: "meta",
  control: "ctrl",
  opt: "alt",
  option: "alt"
}

export const normalizeModifier = (m: string) => MODS[m.toLowerCase()] || m.toLowerCase()

export const formatShortcutKeys = (k: string): string[] =>
  k.split(/[_-]/).map((p) => {
    const norm = normalizeModifier(p)
    return KEYS[norm] ?? (p ? p[0]!.toUpperCase() + p.slice(1) : "")
  })

export const activeShortcutsStore = atom<RegisteredShortcut[]>([])

const isUsingInput = (el: Element | null): boolean | string => {
  const target = (el?.shadowRoot?.activeElement || el) as HTMLElement | null
  return target && (/INPUT|TEXTAREA|SELECT/.test(target.tagName) || target.isContentEditable)
    ? target.getAttribute("name") || true
    : false
}

const isEnabled = (s: Shortcut, input: boolean | string) =>
  s.usingInput === true || (s.usingInput ? input === s.usingInput : !input)

const normalizeCombo = (combo: string) => {
  const parts = combo.toLowerCase().split("_")
  const main = parts.pop() || ""
  const mods = new Set(parts.map(normalizeModifier))
  return `${mods.has("meta") ? "meta_" : ""}${mods.has("ctrl") ? "ctrl_" : ""}${mods.has("alt") ? "alt_" : ""}${mods.has("shift") ? "shift_" : ""}${main}`
}

export function defineShortcuts(
  config: ShortcutsConfig,
  options: ShortcutsOptions = {}
): () => void {
  if (typeof window === "undefined") return () => {}

  const map = new Map<string, Shortcut>()
  const reg: RegisteredShortcut[] = []

  for (const [k, cfg] of Object.entries(config)) {
    if (!cfg) continue
    const obj = typeof cfg === "object" ? cfg : null
    const handler = obj ? obj.handler : cfg
    if (typeof handler !== "function") continue

    const key =
      k.includes("-") && k !== "-" && !k.includes("_") ? k.toLowerCase() : normalizeCombo(k)
    map.set(key, { handler, usingInput: obj?.usingInput })

    if (obj?.label || obj?.description) {
      reg.push({
        id: `${obj.category || "system"}-${k}`,
        keys: formatShortcutKeys(k),
        category: obj.category || "system",
        label: obj.label,
        description: obj.description,
        order: obj.order
      })
    }
  }

  const ids = new Set(reg.map((i) => i.id))
  if (ids.size) {
    activeShortcutsStore.set(
      activeShortcutsStore
        .get()
        .filter((i) => !ids.has(i.id))
        .concat(reg)
    )
  }

  const buffer: string[] = []
  let timer: ReturnType<typeof setTimeout> | undefined

  const onKeyDown = (e: KeyboardEvent) => {
    if (!e.key || e.isComposing) return
    const key = e.key === " " ? "space" : e.key.toLowerCase()
    const input = isUsingInput(document.activeElement)

    buffer.push(key)
    if (buffer.length > 2) buffer.shift()
    clearTimeout(timer)

    // Chained sequence check (e.g. g-d)
    if (buffer.length === 2) {
      const chainedMatch = map.get(buffer.join("-"))
      if (chainedMatch && isEnabled(chainedMatch, input)) {
        e.preventDefault()
        chainedMatch.handler(e)
        buffer.length = 0
        return
      }
    }

    // Unified event normalization
    const sig = `${e.metaKey ? "meta_" : ""}${e.ctrlKey ? "ctrl_" : ""}${e.altKey ? "alt_" : ""}${e.shiftKey ? "shift_" : ""}${key}`
    const primarySig =
      !isMac && e.ctrlKey && !e.metaKey
        ? `meta_${e.altKey ? "alt_" : ""}${e.shiftKey ? "shift_" : ""}${key}`
        : sig

    const match = map.get(sig) || map.get(primarySig) || map.get(key)
    if (match && isEnabled(match, input)) {
      e.preventDefault()
      match.handler(e)
      buffer.length = 0
      return
    }

    timer = setTimeout(() => void (buffer.length = 0), options.chainDelay ?? 800)
  }

  window.addEventListener("keydown", onKeyDown)
  return () => {
    window.removeEventListener("keydown", onKeyDown)
    clearTimeout(timer)
    if (ids.size) {
      activeShortcutsStore.set(activeShortcutsStore.get().filter((i) => !ids.has(i.id)))
    }
  }
}
