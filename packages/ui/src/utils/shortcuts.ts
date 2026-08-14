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

const MODIFIERS: Record<string, "ctrl" | "meta" | "shift" | "alt"> = {
  ctrl: "ctrl",
  control: "ctrl",
  meta: "meta",
  command: "meta",
  shift: "shift",
  alt: "alt",
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
  command: isMac ? "⌘" : "Ctrl",
  ctrl: "Ctrl",
  control: "Ctrl",
  alt: isMac ? "⌥" : "Alt",
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

const SPECIAL_CODES: Record<string, string> = {
  arrowup: "ArrowUp",
  arrowdown: "ArrowDown",
  arrowleft: "ArrowLeft",
  arrowright: "ArrowRight"
}

const isChained = (k: string) => k.includes("-") && k !== "-" && !k.includes("_")

const formatCache = new Map<string, string[]>()
export function formatShortcutKeys(keyStr: string): string[] {
  let res = formatCache.get(keyStr)
  if (!res) {
    res = keyStr
      .split(isChained(keyStr) ? "-" : "_")
      .map((p) => keySymbols[p.toLowerCase()] ?? p.charAt(0).toUpperCase() + p.slice(1))
    formatCache.set(keyStr, res)
  }
  return res
}

export const activeShortcutsStore = atom<RegisteredShortcut[]>([])

const toCode = (k: string) => {
  if (k.length === 1) {
    return /[a-z]/i.test(k) ? `Key${k.toUpperCase()}` : /\d/.test(k) ? `Digit${k}` : k
  }
  if (/^f\d+$/i.test(k)) return k.toUpperCase()
  return SPECIAL_CODES[k.toLowerCase()] || k.charAt(0).toUpperCase() + k.slice(1).toLowerCase()
}

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"])
function isUsingInput(el: Element | null): boolean | string {
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement
  if (!el) return false
  const isEditable = el instanceof HTMLElement && el.isContentEditable
  return INPUT_TAGS.has(el.tagName) || isEditable ? el.getAttribute("name") || true : false
}

const isShortcutEnabled = (s: Shortcut, inputState: boolean | string): boolean =>
  !s.usingInput
    ? !inputState
    : typeof s.usingInput === "string"
      ? inputState === s.usingInput
      : true

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
    const usingInput = isFn ? false : (cfg.usingInput ?? false)
    const chainedKey = isChained(rawKey)

    if (typeof handler === "function") {
      const rawParts = rawKey.toLowerCase().split(chainedKey ? "-" : "_")
      let hasCtrl = false
      let hasMeta = false
      let hasShift = false
      let hasAlt = false
      const nonMods: string[] = []

      for (const p of rawParts) {
        const mod = MODIFIERS[p]
        if (mod === "ctrl") hasCtrl = true
        else if (mod === "meta") hasMeta = true
        else if (mod === "shift") hasShift = true
        else if (mod === "alt") hasAlt = true
        else nonMods.push(p)
      }

      const base = chainedKey ? rawKey.toLowerCase() : nonMods.join("_")
      if (chainedKey) maxChain = Math.max(maxChain, rawParts.length)

      const ctrl = hasCtrl || (!isMac && hasMeta)

      const sc: Shortcut = {
        key: base,
        code: toCode(base),
        handler,
        chained: chainedKey,
        ctrlKey: ctrl,
        metaKey: isMac && hasMeta,
        shiftKey: hasShift,
        altKey: hasAlt,
        usingInput
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
        ...(cfg.label !== undefined && { label: cfg.label }),
        ...(cfg.description !== undefined && { description: cfg.description }),
        ...(cfg.order !== undefined && { order: cfg.order })
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

  const removeRegistered = () => {
    if (regIds) {
      activeShortcutsStore.set(activeShortcutsStore.get().filter((i) => !regIds.has(i.id)))
    }
  }

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
        if (match && isShortcutEnabled(match, inputState)) {
          trigger(match)
          return
        }
      }
    }

    for (const s of standard) {
      if (e.ctrlKey !== s.ctrlKey || e.metaKey !== s.metaKey || e.altKey !== s.altKey) continue
      if (s.altKey ? e.code !== s.code : e.key.toLowerCase() !== s.key) continue
      if (s.shiftKey && !e.shiftKey) continue
      if (
        !s.shiftKey &&
        e.shiftKey &&
        ((s.key.length === 1 && s.key >= "a" && s.key <= "z") || SHIFTABLE.has(s.key))
      )
        continue
      if (isShortcutEnabled(s, inputState)) {
        trigger(s)
        return
      }
    }

    timer = setTimeout(() => {
      inputs.length = 0
    }, chainDelay)
  }

  window.addEventListener("keydown", onKeyDown)
  return () => {
    window.removeEventListener("keydown", onKeyDown)
    clearTimeout(timer)
    removeRegistered()
  }
}
