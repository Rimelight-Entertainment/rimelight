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

// OS detection
const macOS =
  typeof window !== "undefined" &&
  typeof navigator !== "undefined" &&
  /Macintosh;/.test(navigator.userAgent)

// Modifiers map for human-readable display
const kbdKeysMap: Record<string, string> = {
  meta: macOS ? "⌘" : "Ctrl",
  command: macOS ? "⌘" : "Ctrl",
  ctrl: "Ctrl",
  control: "Ctrl",
  alt: macOS ? "⌥" : "Alt",
  option: macOS ? "⌥" : "Alt",
  shift: macOS ? "⇧" : "Shift",
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

const shortcutKeyFormatCache = new Map<string, string[]>()

// Convert a combination string (e.g. meta_alt_t) into platform-specific readable key symbol arrays
export function formatShortcutKeys(keyStr: string): string[] {
  const cached = shortcutKeyFormatCache.get(keyStr)
  if (cached) return cached

  const parts = keyStr.split("_")
  const result = parts.map((part) => {
    const lower = part.toLowerCase()
    if (kbdKeysMap[lower] !== undefined) {
      return kbdKeysMap[lower]
    }
    if (lower.length === 1) {
      return lower.toUpperCase()
    }
    return part.charAt(0).toUpperCase() + part.slice(1)
  })

  shortcutKeyFormatCache.set(keyStr, result)
  return result
}

// Reactive store containing all currently registered shortcuts on the page
export const activeShortcutsStore = atom<RegisteredShortcut[]>([])

const specialKeysMap: Record<string, string> = {
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

// Simple key to code conversion for layout/translation independence under Alt
function convertKeyToCode(key: string): string {
  if (/^[a-z]$/i.test(key)) return `Key${key.toUpperCase()}`
  if (/^\d$/.test(key)) return `Digit${key}`
  if (/^f\d+$/i.test(key)) return key.toUpperCase()
  return specialKeysMap[key.toLowerCase()] || key
}

const SHIFTABLE_KEYS = new Set([
  "arrowleft",
  "arrowright",
  "arrowup",
  "arrowdown",
  "tab",
  "escape",
  "enter",
  "backspace"
])

// Input tag checking
function isUsingInput(activeElement: Element | null): boolean | string {
  let el = activeElement
  while (el && el.shadowRoot && el.shadowRoot.activeElement) {
    el = el.shadowRoot.activeElement
  }
  if (!el) return false
  const tagName = el.tagName
  const isContentEditable =
    typeof HTMLElement !== "undefined" && el instanceof HTMLElement && el.isContentEditable
  const contentEditable = el.getAttribute("contenteditable")
  const isInput =
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    isContentEditable ||
    contentEditable === "true" ||
    contentEditable === "plaintext-only"
  if (isInput) {
    return el.getAttribute("name") || true
  }
  return false
}

interface ParsedShortcuts {
  shortcuts: Shortcut[]
  registered: RegisteredShortcut[]
}

const parseCache = new WeakMap<ShortcutsConfig, ParsedShortcuts>()

function parseShortcutConfig(config: ShortcutsConfig): ParsedShortcuts {
  const cached = parseCache.get(config)
  if (cached) return cached

  const shortcuts: Shortcut[] = Object.entries(config)
    .map(([key, shortcutConfig]): Shortcut | null => {
      if (!shortcutConfig) return null

      let handler: Handler
      let usingInput: boolean | string = false

      if (typeof shortcutConfig === "function") {
        handler = shortcutConfig
      } else {
        handler = shortcutConfig.handler
        usingInput = shortcutConfig.usingInput ?? false
      }

      if (!handler) return null

      const chained = key.includes("-") && key !== "-" && !key.includes("_")
      let baseKey = ""
      let ctrlKey = false
      let metaKey = false
      let shiftKey = false
      let altKey = false

      if (chained) {
        baseKey = key.toLowerCase()
      } else {
        const parts = key.toLowerCase().split("_")
        baseKey = parts
          .filter((p) => !["meta", "command", "ctrl", "shift", "alt", "option"].includes(p))
          .join("_")
        ctrlKey = parts.includes("ctrl")
        metaKey = parts.includes("meta") || parts.includes("command")
        shiftKey = parts.includes("shift")
        altKey = parts.includes("alt") || parts.includes("option")

        if (!macOS && metaKey && !ctrlKey) {
          metaKey = false
          ctrlKey = true
        }
      }

      return { key: baseKey, handler, chained, ctrlKey, metaKey, shiftKey, altKey, usingInput }
    })
    .filter((item): item is Shortcut => item !== null)

  const registered: RegisteredShortcut[] = Object.entries(config).flatMap(
    ([key, shortcutConfig]) => {
      if (!shortcutConfig || typeof shortcutConfig !== "object") return []

      const { label, description, category, order } = shortcutConfig
      if (!label && !description) return []

      const itemCategory = category || "system"
      const item: RegisteredShortcut = {
        id: `${itemCategory}-${key}`,
        keys: formatShortcutKeys(key),
        category: itemCategory
      }
      if (label) item.label = label
      if (description) item.description = description
      if (order !== undefined) item.order = order
      return [item]
    }
  )

  const result = { shortcuts, registered }
  parseCache.set(config, result)
  return result
}

export function defineShortcuts(
  config: ShortcutsConfig,
  options: ShortcutsOptions = {}
): () => void {
  if (typeof window === "undefined") {
    return () => {}
  }

  const { shortcuts: parsedShortcuts, registered: itemsToRegister } = parseShortcutConfig(config)

  const chainDelay = options.chainDelay ?? 800
  const maxChainLength = Math.max(
    2,
    ...parsedShortcuts.filter((s) => s.chained).map((s) => s.key.split("-").length)
  )
  const chainedInputs: string[] = []
  let debounceTimer: ReturnType<typeof setTimeout> | undefined

  const clearChainedInput = () => {
    chainedInputs.length = 0
  }

  if (itemsToRegister.length > 0) {
    const newIds = new Set(itemsToRegister.map((item) => item.id))
    const existing = activeShortcutsStore.get().filter((item) => !newIds.has(item.id))
    activeShortcutsStore.set([...existing, ...itemsToRegister])
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (!e.key) return

    const activeEl = document.activeElement
    const currentlyUsingInput = isUsingInput(activeEl)

    // Helper to check if a shortcut is enabled given current focus state
    const isShortcutEnabled = (shortcut: Shortcut) => {
      if (!shortcut.usingInput) {
        return !currentlyUsingInput
      }
      if (typeof shortcut.usingInput === "string") {
        return currentlyUsingInput === shortcut.usingInput
      }
      return true
    }

    // Handle chained shortcuts
    chainedInputs.push(e.key.toLowerCase())
    if (chainedInputs.length > maxChainLength) {
      chainedInputs.shift()
    }
    clearTimeout(debounceTimer)

    if (chainedInputs.length >= 2) {
      for (let len = Math.min(chainedInputs.length, maxChainLength); len >= 2; len--) {
        const chainedKey = chainedInputs.slice(-len).join("-")
        const matchedChained = parsedShortcuts.find((s) => s.chained && s.key === chainedKey)
        if (matchedChained && isShortcutEnabled(matchedChained)) {
          e.preventDefault()
          matchedChained.handler(e)
          clearChainedInput()
          return
        }
      }
    }

    // Handle standard shortcuts
    for (const shortcut of parsedShortcuts) {
      if (shortcut.chained) continue

      if (e.ctrlKey !== shortcut.ctrlKey) continue
      if (e.metaKey !== shortcut.metaKey) continue
      if (e.altKey !== shortcut.altKey) continue

      // Match by code when Alt modifier is active to avoid key translation issues
      const useCode = shortcut.altKey && e.altKey
      if (useCode) {
        if (e.code !== convertKeyToCode(shortcut.key)) continue
      } else {
        const pressedKey = e.key.toLowerCase()
        if (pressedKey !== shortcut.key) continue
      }

      // Shift modifier check
      const alphabetKey = /^[a-z]$/i.test(shortcut.key)
      const shiftableKey = SHIFTABLE_KEYS.has(shortcut.key)

      if (shortcut.shiftKey && !e.shiftKey) continue
      if (!shortcut.shiftKey && e.shiftKey && (alphabetKey || shiftableKey)) continue

      if (isShortcutEnabled(shortcut)) {
        e.preventDefault()
        shortcut.handler(e)
        clearChainedInput()
        return
      }
    }

    debounceTimer = setTimeout(clearChainedInput, chainDelay)
  }

  window.addEventListener("keydown", onKeyDown)

  return () => {
    window.removeEventListener("keydown", onKeyDown)
    clearTimeout(debounceTimer)

    // Unregister items from the active store safely per instance
    if (itemsToRegister.length > 0) {
      const current = activeShortcutsStore.get()
      const updated = [...current]
      for (const item of itemsToRegister) {
        const idx = updated.findIndex(
          (registeredItem) => registeredItem === item || registeredItem.id === item.id
        )
        if (idx !== -1) {
          updated.splice(idx, 1)
        }
      }
      activeShortcutsStore.set(updated)
    }
  }
}
