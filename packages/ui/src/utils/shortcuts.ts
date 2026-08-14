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

const MODIFIERS = new Set(["meta", "command", "ctrl", "control", "shift", "alt", "option"])
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

const specialCodes: Record<string, string> = {
  space: "Space",
  enter: "Enter",
  escape: "Escape",
  tab: "Tab",
  backspace: "Backspace",
  delete: "Delete",
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

const toCode = (k: string) =>
  k.length === 1 && /[a-z]/i.test(k)
    ? `Key${k.toUpperCase()}`
    : k.length === 1 && /\d/.test(k)
      ? `Digit${k}`
      : /^f\d+$/i.test(k)
        ? k.toUpperCase()
        : specialCodes[k.toLowerCase()] || k

function isUsingInput(el: Element | null): boolean | string {
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement
  if (!el) return false
  const t = el.tagName
  return t === "INPUT" ||
    t === "TEXTAREA" ||
    t === "SELECT" ||
    (el instanceof HTMLElement && el.isContentEditable)
    ? el.getAttribute("name") || true
    : false
}

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
      const parts = rawKey.toLowerCase().split(chainedKey ? "-" : "_")
      const base = chainedKey
        ? rawKey.toLowerCase()
        : parts.filter((p) => !MODIFIERS.has(p)).join("_")
      if (chainedKey) maxChain = Math.max(maxChain, parts.length)

      let [ctrl, meta, shift, alt] = [
        parts.some((p) => p === "ctrl" || p === "control"),
        parts.some((p) => p === "meta" || p === "command"),
        parts.includes("shift"),
        parts.some((p) => p === "alt" || p === "option")
      ]
      if (!isMac && meta && !ctrl) {
        meta = false
        ctrl = true
      }

      const sc: Shortcut = {
        key: base,
        handler,
        chained: chainedKey,
        ctrlKey: ctrl,
        metaKey: meta,
        shiftKey: shift,
        altKey: alt,
        usingInput
      }
      if (chainedKey) chained.set(base, sc)
      else standard.push(sc)
    }

    if (typeof cfg === "object" && cfg && (cfg.label || cfg.description)) {
      const cat = cfg.category || "system"
      registered.push({
        id: `${cat}-${rawKey}`,
        keys: formatShortcutKeys(rawKey),
        category: cat,
        ...(cfg.label && { label: cfg.label }),
        ...(cfg.description && { description: cfg.description }),
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

  if (regIds) {
    activeShortcutsStore.set([
      ...activeShortcutsStore.get().filter((i) => !regIds.has(i.id)),
      ...registered
    ])
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (!e.key) return
    const inputState = isUsingInput(document.activeElement)
    const enabled = (s: Shortcut) =>
      !s.usingInput
        ? !inputState
        : typeof s.usingInput === "string"
          ? inputState === s.usingInput
          : true

    inputs.push(e.key.toLowerCase())
    if (inputs.length > maxChain) inputs.shift()
    clearTimeout(timer)

    if (inputs.length >= 2 && chained.size > 0) {
      for (let len = Math.min(inputs.length, maxChain); len >= 2; len--) {
        const match = chained.get(inputs.slice(-len).join("-"))
        if (match && enabled(match)) {
          e.preventDefault()
          match.handler(e)
          inputs.length = 0
          return
        }
      }
    }

    for (const s of standard) {
      if (e.ctrlKey !== s.ctrlKey || e.metaKey !== s.metaKey || e.altKey !== s.altKey) continue
      if (s.altKey && e.altKey ? e.code !== toCode(s.key) : e.key.toLowerCase() !== s.key) continue
      if (s.shiftKey && !e.shiftKey) continue
      if (
        !s.shiftKey &&
        e.shiftKey &&
        ((s.key.length === 1 && /^[a-z]$/i.test(s.key)) || SHIFTABLE.has(s.key))
      )
        continue
      if (enabled(s)) {
        e.preventDefault()
        s.handler(e)
        inputs.length = 0
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
    if (regIds) {
      activeShortcutsStore.set(activeShortcutsStore.get().filter((i) => !regIds.has(i.id)))
    }
  }
}
