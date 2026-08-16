import { atom } from "nanostores"

export type Handler = (e: KeyboardEvent) => void

export interface ShortcutConfig {
  handler: Handler
  usingInput?: boolean | string
  label?: string
  description?: string
  category?: string
  order?: number
}

export interface ShortcutsConfig {
  [key: string]: ShortcutConfig | Handler | false | null | undefined
}

export interface ShortcutsOptions {
  chainDelay?: number
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

const CTRL = 1
const META = 2
const ALT = 4
const SHIFT = 8

const isMac = typeof navigator !== "undefined" && /Mac|iPad|iPhone|iPod/.test(navigator.userAgent)

const SYMBOLS: Record<string, string> = {
  meta: isMac ? "⌘" : "Ctrl",
  cmd: isMac ? "⌘" : "Ctrl",
  command: isMac ? "⌘" : "Ctrl",
  ctrl: "Ctrl",
  control: "Ctrl",
  alt: isMac ? "⌥" : "Alt",
  opt: isMac ? "⌥" : "Alt",
  option: isMac ? "⌥" : "Alt",
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
  ctrl: CTRL,
  control: CTRL,
  cmd: isMac ? META : CTRL,
  command: isMac ? META : CTRL,
  meta: isMac ? META : CTRL,
  alt: ALT,
  opt: ALT,
  option: ALT,
  shift: SHIFT
}

export function formatShortcutKeys(keyStr: string): string[] {
  return keyStr
    .split(/[_-]/)
    .map((p) => SYMBOLS[p.toLowerCase()] ?? (p ? p[0]!.toUpperCase() + p.slice(1) : ""))
}

export const activeShortcutsStore = atom<RegisteredShortcut[]>([])

const syncShortcuts = (add: RegisteredShortcut[], removeIds?: Set<string>) =>
  activeShortcutsStore.set([
    ...activeShortcutsStore.get().filter((i) => !removeIds?.has(i.id)),
    ...add
  ])

const isUsingInput = (el: Element | null): boolean | string => {
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement
  return el &&
    (/^(?:INPUT|TEXTAREA|SELECT)$/.test(el.nodeName) || (el as HTMLElement).isContentEditable)
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

  const standard: Shortcut[] = []
  const chained = new Map<string, Shortcut>()
  const registered: RegisteredShortcut[] = []
  let maxChain = 2

  for (const [rawKey, cfg] of Object.entries(config)) {
    if (!cfg) continue
    const handler = typeof cfg === "function" ? cfg : cfg.handler
    if (typeof handler !== "function") continue

    const isChained = rawKey.includes("-") && rawKey !== "-" && !rawKey.includes("_")
    const parts = rawKey.toLowerCase().split(isChained ? "-" : "_")
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
        ...(cfg.label && { label: cfg.label }),
        ...(cfg.description && { description: cfg.description }),
        ...(cfg.order != null && { order: cfg.order })
      })
    }
  }

  const ids = new Set(registered.map((i) => i.id))
  if (ids.size) syncShortcuts(registered, ids)

  const inputs: string[] = []
  let timer: ReturnType<typeof setTimeout> | undefined

  const onKeyDown = (e: KeyboardEvent) => {
    if (!e.key) return
    const input = isUsingInput(document.activeElement)
    const trigger = (s: Shortcut) => {
      e.preventDefault()
      s.handler(e)
      inputs.length = 0
    }

    inputs.push(e.key.toLowerCase())
    if (inputs.length > maxChain) inputs.shift()
    clearTimeout(timer)

    if (inputs.length >= 2 && chained.size > 0) {
      for (let len = Math.min(inputs.length, maxChain); len >= 2; len--) {
        const match = chained.get(inputs.slice(-len).join("-"))
        if (match && isEnabled(match, input)) return trigger(match)
      }
    }

    const eventMods =
      (e.ctrlKey ? CTRL : 0) |
      (e.metaKey ? META : 0) |
      (e.altKey ? ALT : 0) |
      (e.shiftKey ? SHIFT : 0)

    for (const s of standard) {
      if ((s.mods & 7) !== (eventMods & 7)) continue

      const code = e.code.toLowerCase()
      if (
        s.mods & ALT
          ? code !== `key${s.key}` && code !== `digit${s.key}` && code !== s.key
          : e.key.toLowerCase() !== s.key
      )
        continue

      if (
        Boolean(s.mods & SHIFT) !== e.shiftKey &&
        (s.mods & SHIFT || /^[a-z]$/.test(s.key) || SHIFTABLE.has(s.key))
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
