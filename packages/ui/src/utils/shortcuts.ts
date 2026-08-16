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
  ctrl?: boolean
  meta?: boolean
  alt?: boolean
  shift?: boolean
  usingInput?: boolean | string
}

const isMac = typeof navigator !== "undefined" && /Mac|iPad|iPhone|iPod/.test(navigator.userAgent)

const KEY_SYMBOLS: Record<string, string> = {
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

const formatCache = new Map<string, string[]>()
export function formatShortcutKeys(keyStr: string): string[] {
  let res = formatCache.get(keyStr)
  if (!res) {
    if (formatCache.size > 200) formatCache.clear()
    res = keyStr
      .split(/[_-]/)
      .map((p) => KEY_SYMBOLS[p.toLowerCase()] ?? (p ? p[0]!.toUpperCase() + p.slice(1) : ""))
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
      : /^arrow/i.test(k)
        ? `Arrow${k[5]?.toUpperCase() ?? ""}${k.slice(6).toLowerCase()}`
        : /^f\d+$/i.test(k)
          ? k.toUpperCase()
          : (k[0]?.toUpperCase() ?? "") + k.slice(1).toLowerCase()

const isUsingInput = (el: Element | null): boolean | string => {
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement
  return el &&
    (/^(?:INPUT|TEXTAREA|SELECT)$/.test(el.nodeName) || (el as HTMLElement).isContentEditable)
    ? el.getAttribute("name") || true
    : false
}

const isEnabled = (s: Shortcut, inputState: boolean | string) =>
  s.usingInput === true || (s.usingInput ? inputState === s.usingInput : !inputState)

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
    const isFn = typeof cfg === "function"
    const handler = isFn ? cfg : cfg.handler
    if (typeof handler !== "function") continue

    const isChained = rawKey.includes("-") && rawKey !== "-" && !rawKey.includes("_")
    const parts = rawKey.toLowerCase().split(isChained ? "-" : "_")
    let ctrl = false
    let meta = false
    let alt = false
    let shift = false
    const nonMods: string[] = []

    for (const p of parts) {
      if (p === "ctrl" || p === "control") ctrl = true
      else if (p === "cmd" || p === "command" || p === "meta") {
        if (isMac) meta = true
        else ctrl = true
      } else if (p === "alt" || p === "opt" || p === "option") alt = true
      else if (p === "shift") shift = true
      else nonMods.push(p)
    }

    const base = isChained ? rawKey.toLowerCase() : nonMods.join("_")
    if (isChained) maxChain = Math.max(maxChain, parts.length)

    const shortcut: Shortcut = {
      key: base,
      code: toCode(base),
      handler,
      ctrl,
      meta,
      alt,
      shift,
      usingInput: !isFn && (cfg.usingInput ?? false)
    }

    if (isChained) chained.set(base, shortcut)
    else standard.push(shortcut)

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
  if (ids.size) {
    activeShortcutsStore.set([
      ...activeShortcutsStore.get().filter((i) => !ids.has(i.id)),
      ...registered
    ])
  }

  const inputs: string[] = []
  let timer: ReturnType<typeof setTimeout> | undefined

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
        if (match && isEnabled(match, inputState)) return trigger(match)
      }
    }

    for (const s of standard) {
      if (
        Boolean(s.ctrl) !== e.ctrlKey ||
        Boolean(s.meta) !== e.metaKey ||
        Boolean(s.alt) !== e.altKey
      )
        continue

      if (s.alt ? e.code !== s.code : e.key.toLowerCase() !== s.key) continue
      if (
        Boolean(s.shift) !== e.shiftKey &&
        (s.shift || /^[a-z]$/.test(s.key) || SHIFTABLE.has(s.key))
      )
        continue
      if (isEnabled(s, inputState)) return trigger(s)
    }

    timer = setTimeout(() => void (inputs.length = 0), options.chainDelay ?? 800)
  }

  window.addEventListener("keydown", onKeyDown)
  return () => {
    window.removeEventListener("keydown", onKeyDown)
    clearTimeout(timer)
    if (ids.size) activeShortcutsStore.set(activeShortcutsStore.get().filter((i) => !ids.has(i.id)))
  }
}
