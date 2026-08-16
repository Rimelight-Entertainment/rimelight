import { atom } from "nanostores"

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
  key: string
  handler: Handler
  mods: number
  usingInput?: boolean | string | undefined
}

const isMac = typeof navigator !== "undefined" && /Mac|iP/.test(navigator.userAgent),
  MOD_CMD = isMac ? 2 : 1

const SYMBOLS: Record<string, string> = {
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

const SHIFTABLE = new Set([
  "arrowleft",
  "arrowright",
  "arrowup",
  "arrowdown",
  "tab",
  "escape",
  "enter",
  "backspace"
])

const MOD_MASKS: Record<string, number> = {
  ctrl: 1,
  control: 1,
  cmd: MOD_CMD,
  command: MOD_CMD,
  meta: MOD_CMD,
  alt: 4,
  opt: 4,
  option: 4,
  shift: 8
}

export const formatShortcutKeys = (keyStr: string): string[] =>
  keyStr.split(/[_-]/).map((p) => {
    const k = p.toLowerCase()
    if (/^(?:meta|cmd|command)$/.test(k)) return isMac ? "⌘" : "Ctrl"
    if (/^(?:alt|opt|option)$/.test(k)) return isMac ? "⌥" : "Alt"
    if (/^(?:ctrl|control)$/.test(k)) return "Ctrl"
    if (k === "shift") return isMac ? "⇧" : "Shift"
    return SYMBOLS[k] ?? (p ? p[0]!.toUpperCase() + p.slice(1) : "")
  })

export const activeShortcutsStore = atom<RegisteredShortcut[]>([])

const syncShortcuts = (add: RegisteredShortcut[], removeIds: Set<string>) =>
  activeShortcutsStore.set(
    activeShortcutsStore
      .get()
      .filter((i) => !removeIds.has(i.id))
      .concat(add)
  )

const isUsingInput = (el: Element | null): boolean | string => {
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement
  return el && (/INPUT|TEXTAREA|SELECT/.test(el.nodeName) || (el as HTMLElement).isContentEditable)
    ? el.getAttribute("name") || true
    : false
}

const isEnabled = (s: Shortcut, input: boolean | string) =>
  s.usingInput === true || (s.usingInput ? input === s.usingInput : !input)

export function defineShortcuts(
  config: ShortcutsConfig,
  options: ShortcutsOptions = {}
): () => void {
  if (typeof window === "undefined") return () => {}

  const standard: Shortcut[] = [],
    chained = new Map<string, Shortcut>(),
    registered: RegisteredShortcut[] = []
  let maxChain = 2

  for (const [rawKey, cfg] of Object.entries(config)) {
    if (!cfg) continue
    const handler = typeof cfg === "function" ? cfg : cfg.handler
    if (typeof handler !== "function") continue

    const isChained = rawKey.includes("-") && rawKey !== "-" && !rawKey.includes("_"),
      parts = rawKey.toLowerCase().split(isChained ? "-" : "_")
    let mods = 0
    const nonMods: string[] = []

    for (const p of parts) {
      const m = MOD_MASKS[p]
      if (m) mods |= m
      else nonMods.push(p)
    }

    const base = isChained ? rawKey.toLowerCase() : nonMods.join("_")
    if (isChained) maxChain = Math.max(maxChain, parts.length)

    const s: Shortcut = {
      key: base,
      handler,
      mods,
      usingInput: typeof cfg === "object" ? cfg.usingInput : false
    }
    if (isChained) chained.set(base, s)
    else standard.push(s)

    if (typeof cfg === "object" && (cfg.label || cfg.description)) {
      const category = cfg.category || "system"
      registered.push({
        id: `${category}-${rawKey}`,
        keys: formatShortcutKeys(rawKey),
        category,
        label: cfg.label,
        description: cfg.description,
        order: cfg.order
      })
    }
  }

  const ids = new Set(registered.map((i) => i.id))
  if (ids.size) syncShortcuts(registered, ids)

  const inputs: string[] = []
  let timer: ReturnType<typeof setTimeout> | undefined

  const onKeyDown = (e: KeyboardEvent) => {
    if (!e.key) return
    const input = isUsingInput(document.activeElement),
      trigger = (s: Shortcut) => {
        e.preventDefault()
        s.handler(e)
        inputs.length = 0
      }

    inputs.push(e.key.toLowerCase())
    if (inputs.length > maxChain) inputs.shift()
    clearTimeout(timer)

    if (inputs.length >= 2 && chained.size) {
      for (let len = Math.min(inputs.length, maxChain); len >= 2; len--) {
        const match = chained.get(inputs.slice(-len).join("-"))
        if (match && isEnabled(match, input)) return trigger(match)
      }
    }

    const eventMods = +e.ctrlKey | (+e.metaKey << 1) | (+e.altKey << 2) | (+e.shiftKey << 3)

    for (const s of standard) {
      if ((s.mods & 7) !== (eventMods & 7)) continue
      const code = e.code.toLowerCase()
      if (
        s.mods & 4
          ? code !== `key${s.key}` && code !== `digit${s.key}` && code !== s.key
          : e.key.toLowerCase() !== s.key
      )
        continue
      if (
        Boolean(s.mods & 8) !== e.shiftKey &&
        (s.mods & 8 || /^[a-z]$/.test(s.key) || SHIFTABLE.has(s.key))
      )
        continue
      if (isEnabled(s, input)) return trigger(s)
    }

    timer = setTimeout(() => void (inputs.length = 0), options.chainDelay ?? 800)
  }

  window.addEventListener("keydown", onKeyDown)
  return () => {
    window.removeEventListener("keydown", onKeyDown)
    clearTimeout(timer)
    if (ids.size) syncShortcuts([], ids)
  }
}
