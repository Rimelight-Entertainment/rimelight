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
  label?: string
  description?: string
  category?: string
  order?: number
}

interface Shortcut {
  key: string
  code: string
  handler: Handler
  mods: number
  usingInput?: boolean | string
}

const CTRL = 1
const META = 2
const SHIFT = 4
const ALT = 8

const isMac = typeof navigator !== "undefined" && /Mac|iPad|iPhone|iPod/.test(navigator.userAgent)

const MOD_BITS: Record<string, number> = {
  ctrl: CTRL,
  control: CTRL,
  cmd: META,
  command: META,
  meta: META,
  opt: ALT,
  option: ALT,
  alt: ALT,
  shift: SHIFT
}

const KEY_SYMBOLS: Record<string, string> = {
  meta: isMac ? "⌘" : "Ctrl",
  ctrl: "Ctrl",
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

const formatCache = new Map<string, string[]>()
export function formatShortcutKeys(keyStr: string): string[] {
  let res = formatCache.get(keyStr)
  if (!res) {
    if (formatCache.size > 200) formatCache.clear()
    formatCache.set(
      keyStr,
      (res = keyStr.split(/[_-]/).map((p) => {
        const l = p.toLowerCase()
        const canonical =
          l === "cmd" || l === "command"
            ? "meta"
            : l === "opt" || l === "option"
              ? "alt"
              : l === "control"
                ? "ctrl"
                : l
        return KEY_SYMBOLS[canonical] ?? (p ? p[0]!.toUpperCase() + p.slice(1) : "")
      }))
    )
  }
  return res
}

export const activeShortcutsStore = atom<RegisteredShortcut[]>([])

const toCode = (k: string) =>
  /^[a-z]$/i.test(k)
    ? `Key${k.toUpperCase()}`
    : /^\d$/.test(k)
      ? `Digit${k}`
      : /^arrow/i.test(k)
        ? `Arrow${k[5]?.toUpperCase() ?? ""}${k.slice(6).toLowerCase()}`
        : /^f\d+$/i.test(k)
          ? k.toUpperCase()
          : (k[0]?.toUpperCase() ?? "") + k.slice(1).toLowerCase()

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"])
const isUsingInput = (el: Element | null): boolean | string => {
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement
  return el && (INPUT_TAGS.has(el.nodeName) || (el as HTMLElement).isContentEditable)
    ? el.getAttribute("name") || true
    : false
}

const isShortcutEnabled = (s: Shortcut, inputState: boolean | string): boolean =>
  s.usingInput === true || (s.usingInput ? inputState === s.usingInput : !inputState)

interface ParsedShortcuts {
  standard: Shortcut[]
  chained: Map<string, Shortcut>
  maxChain: number
  registered: RegisteredShortcut[]
}

const parseCache = new WeakMap<ShortcutsConfig, ParsedShortcuts>()

function parseShortcutConfig(config: ShortcutsConfig): ParsedShortcuts {
  let cached = parseCache.get(config)
  if (cached) return cached

  const standard: Shortcut[] = []
  const chained = new Map<string, Shortcut>()
  let maxChain = 2
  const registered: RegisteredShortcut[] = []

  for (const [rawKey, cfg] of Object.entries(config)) {
    if (!cfg) continue
    const isFn = typeof cfg === "function"
    const handler = isFn ? cfg : cfg.handler
    const chainedKey = rawKey.includes("-") && rawKey !== "-" && !rawKey.includes("_")

    if (typeof handler === "function") {
      const rawParts = rawKey.toLowerCase().split(chainedKey ? "-" : "_")
      let bitMods = 0
      const nonMods: string[] = []

      for (const p of rawParts) {
        const bit = MOD_BITS[p]
        if (bit) bitMods |= bit
        else nonMods.push(p)
      }

      if (!isMac && bitMods & META) bitMods = (bitMods & ~META) | CTRL

      const base = chainedKey ? rawKey.toLowerCase() : nonMods.join("_")
      if (chainedKey) maxChain = Math.max(maxChain, rawParts.length)

      const sc: Shortcut = {
        key: base,
        code: toCode(base),
        handler,
        mods: bitMods,
        usingInput: !isFn && (cfg.usingInput ?? false)
      }

      if (chainedKey) chained.set(base, sc)
      else standard.push(sc)
    }

    if (typeof cfg === "object" && (cfg.label || cfg.description)) {
      const cat = cfg.category || "system"
      registered.push({
        id: `${cat}-${rawKey}`,
        keys: formatShortcutKeys(rawKey),
        category: cat,
        ...(cfg.label && { label: cfg.label }),
        ...(cfg.description && { description: cfg.description }),
        ...(cfg.order != null && { order: cfg.order })
      })
    }
  }

  cached = { standard, chained, maxChain, registered }
  parseCache.set(config, cached)
  return cached
}

export function defineShortcuts(
  config: ShortcutsConfig,
  options: ShortcutsOptions = {}
): () => void {
  if (typeof window === "undefined") return () => {}

  const { standard, chained, maxChain, registered } = parseShortcutConfig(config)
  const chainDelay = options.chainDelay ?? 800
  const inputs: string[] = []
  let timer: ReturnType<typeof setTimeout> | undefined
  const regIds = registered.length ? new Set(registered.map((i) => i.id)) : null
  const filterOut = (items: RegisteredShortcut[]) =>
    regIds ? items.filter((i) => !regIds.has(i.id)) : items

  if (regIds) activeShortcutsStore.set([...filterOut(activeShortcutsStore.get()), ...registered])

  const onKeyDown = (e: KeyboardEvent) => {
    if (!e.key) return
    const inputState = isUsingInput(document.activeElement)

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
        if (match && isShortcutEnabled(match, inputState)) return trigger(match)
      }
    }

    const eventMods =
      (e.ctrlKey ? CTRL : 0) |
      (e.metaKey ? META : 0) |
      (e.shiftKey ? SHIFT : 0) |
      (e.altKey ? ALT : 0)

    const mainMods = CTRL | META | ALT

    for (const s of standard) {
      if ((s.mods & mainMods) !== (eventMods & mainMods)) continue
      if (s.mods & ALT ? e.code !== s.code : e.key.toLowerCase() !== s.key) continue
      if (
        (s.mods & SHIFT) !== (eventMods & SHIFT) &&
        (s.mods & SHIFT || /^[a-z]$/.test(s.key) || SHIFTABLE.has(s.key))
      )
        continue
      if (isShortcutEnabled(s, inputState)) return trigger(s)
    }

    timer = setTimeout(() => void (inputs.length = 0), chainDelay)
  }

  window.addEventListener("keydown", onKeyDown)
  return () => {
    window.removeEventListener("keydown", onKeyDown)
    clearTimeout(timer)
    if (regIds) activeShortcutsStore.set(filterOut(activeShortcutsStore.get()))
  }
}
