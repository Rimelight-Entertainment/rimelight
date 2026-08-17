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
  MOD_CMD = isMac ? 2 : 1,
  SHIFTABLE = new Set([
    "arrowleft",
    "arrowright",
    "arrowup",
    "arrowdown",
    "tab",
    "escape",
    "enter",
    "backspace"
  ]),
  MODS: Record<string, number> = {
    ctrl: 1,
    control: 1,
    cmd: MOD_CMD,
    command: MOD_CMD,
    meta: MOD_CMD,
    alt: 4,
    opt: 4,
    option: 4,
    shift: 8
  },
  KEYS: Record<string, string> = {
    ctrl: "Ctrl",
    control: "Ctrl",
    cmd: isMac ? "⌘" : "Ctrl",
    command: isMac ? "⌘" : "Ctrl",
    meta: isMac ? "⌘" : "Ctrl",
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

export const formatShortcutKeys = (k: string): string[] =>
  k.split(/[_-]/).map((p) => KEYS[p.toLowerCase()] ?? (p ? p[0]!.toUpperCase() + p.slice(1) : ""))

export const activeShortcutsStore = atom<RegisteredShortcut[]>([])

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
    reg: RegisteredShortcut[] = []
  let maxChain = 2

  for (const [k, cfg] of Object.entries(config)) {
    if (!cfg) continue
    const obj = typeof cfg === "object" ? cfg : null,
      handler = obj ? obj.handler : cfg
    if (typeof handler !== "function") continue

    const chain = k.includes("-") && k !== "-" && !k.includes("_"),
      parts = k.toLowerCase().split(chain ? "-" : "_")
    let mods = 0
    const nonMods = parts.filter((p) => (MODS[p] ? !(mods |= MODS[p]!) : true)),
      base = chain ? k.toLowerCase() : nonMods.join("_"),
      item: Shortcut = { key: base, handler, mods, usingInput: obj?.usingInput }

    if (chain) {
      maxChain = Math.max(maxChain, parts.length)
      chained.set(base, item)
    } else standard.push(item)

    if (obj?.label || obj?.description)
      reg.push({
        id: `${obj.category || "system"}-${k}`,
        keys: formatShortcutKeys(k),
        category: obj.category || "system",
        label: obj.label,
        description: obj.description,
        order: obj.order
      })
  }

  const ids = new Set(reg.map((i) => i.id))
  if (ids.size)
    activeShortcutsStore.set(
      activeShortcutsStore
        .get()
        .filter((i) => !ids.has(i.id))
        .concat(reg)
    )

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

    if (inputs.length >= 2 && chained.size)
      for (let len = Math.min(inputs.length, maxChain); len >= 2; len--) {
        const match = chained.get(inputs.slice(-len).join("-"))
        if (match && isEnabled(match, input)) return trigger(match)
      }

    const eMods = +e.ctrlKey | (+e.metaKey << 1) | (+e.altKey << 2) | (+e.shiftKey << 3),
      c = e.code.toLowerCase(),
      k = e.key.toLowerCase()

    for (const s of standard) {
      if ((s.mods & 7) !== (eMods & 7)) continue
      if (s.mods & 4 ? c !== `key${s.key}` && c !== `digit${s.key}` && c !== s.key : k !== s.key)
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
    if (ids.size) activeShortcutsStore.set(activeShortcutsStore.get().filter((i) => !ids.has(i.id)))
  }
}
