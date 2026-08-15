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

interface Shortcut {
  key: string
  code: string
  handler: Handler
  chained: boolean
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
  altKey: boolean
  usingInput?: boolean | string
}

export interface RegisteredShortcut {
  id: string
  keys: string[]
  label?: string
  description?: string
  category?: string
  order?: number
}

const isMac = typeof navigator !== "undefined" && /Mac|iPad|iPhone|iPod/.test(navigator.userAgent)

const MODIFIER_MAP: Record<string, string> = {
  control: "ctrl",
  cmd: "meta",
  command: "meta",
  opt: "alt",
  option: "alt"
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

const keySymbols: Record<string, string> = {
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

const isChained = (k: string) => k.includes("-") && k !== "-" && !k.includes("_")

const formatCache = new Map<string, string[]>()
export function formatShortcutKeys(keyStr: string): string[] {
  let res = formatCache.get(keyStr)
  if (!res) {
    res = keyStr.split(isChained(keyStr) ? "-" : "_").map((p) => {
      const lower = p.toLowerCase()
      return keySymbols[MODIFIER_MAP[lower] ?? lower] ?? p.charAt(0).toUpperCase() + p.slice(1)
    })
    if (formatCache.size > 200) formatCache.clear()
    formatCache.set(keyStr, res)
  }
  return res
}

export const activeShortcutsStore = atom<RegisteredShortcut[]>([])

const toCode = (k: string) =>
  /^[a-z]$/i.test(k)
    ? `Key${k.toUpperCase()}`
    : /^\d$/.test(k)
      ? `Digit${k}`
      : k.toLowerCase().startsWith("arrow")
        ? `Arrow${k.slice(5).charAt(0).toUpperCase() + k.slice(6)}`
        : /^f\d+$/i.test(k)
          ? k.toUpperCase()
          : k.charAt(0).toUpperCase() + k.slice(1).toLowerCase()

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"])
function isUsingInput(el: Element | null): boolean | string {
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement
  return el && (INPUT_TAGS.has(el.nodeName) || (el instanceof HTMLElement && el.isContentEditable))
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
    const chainedKey = isChained(rawKey)

    if (typeof handler === "function") {
      const rawParts = rawKey.toLowerCase().split(chainedKey ? "-" : "_")
      const mods = new Set(
        rawParts
          .filter(
            (p) =>
              MODIFIER_MAP[p] ??
              (p === "ctrl" || p === "meta" || p === "shift" || p === "alt" ? p : "")
          )
          .map((p) => MODIFIER_MAP[p] ?? p)
      )
      const nonMods = rawParts.filter(
        (p) => !(MODIFIER_MAP[p] ?? (p === "ctrl" || p === "meta" || p === "shift" || p === "alt"))
      )

      const base = chainedKey ? rawKey.toLowerCase() : nonMods.join("_")
      if (chainedKey) maxChain = Math.max(maxChain, rawParts.length)

      const hasMeta = mods.has("meta")
      const ctrl = mods.has("ctrl") || (!isMac && hasMeta)

      const sc: Shortcut = {
        key: base,
        code: toCode(base),
        handler,
        chained: chainedKey,
        ctrlKey: ctrl,
        metaKey: isMac && hasMeta,
        shiftKey: mods.has("shift"),
        altKey: mods.has("alt"),
        usingInput: isFn ? false : (cfg.usingInput ?? false)
      }

      if (chainedKey) chained.set(base, sc)
      else standard.push(sc)
    }

    if (typeof cfg === "object" && (cfg.label || cfg.description)) {
      const cat = cfg.category || "system"
      const entry: RegisteredShortcut = {
        id: `${cat}-${rawKey}`,
        keys: formatShortcutKeys(rawKey),
        category: cat
      }
      if (cfg.label != null) entry.label = cfg.label
      if (cfg.description != null) entry.description = cfg.description
      if (cfg.order != null) entry.order = cfg.order
      registered.push(entry)
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

  const removeRegistered = () =>
    regIds && activeShortcutsStore.set(activeShortcutsStore.get().filter((i) => !regIds.has(i.id)))

  if (regIds) {
    removeRegistered()
    activeShortcutsStore.set([...activeShortcutsStore.get(), ...registered])
  }

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

    for (const s of standard) {
      if (e.ctrlKey !== s.ctrlKey || e.metaKey !== s.metaKey || e.altKey !== s.altKey) continue
      if (s.altKey ? e.code !== s.code : e.key.toLowerCase() !== s.key) continue
      if (
        s.shiftKey !== e.shiftKey &&
        (s.shiftKey || /^[a-z]$/.test(s.key) || SHIFTABLE.has(s.key))
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
    removeRegistered()
  }
}
