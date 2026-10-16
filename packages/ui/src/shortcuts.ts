import { createSignal, createStore } from "solid-js";

export type Handler = (e: KeyboardEvent) => void;
export interface ShortcutConfig {
  handler: Handler;
  usingInput?: boolean | string | undefined;
  label?: string | undefined;
  description?: string | undefined;
  category?: string | undefined;
  order?: number | undefined;
}
export type ShortcutsConfig = Record<string, ShortcutConfig | Handler | false | null | undefined>;
export interface ShortcutsOptions {
  chainDelay?: number | undefined;
}
export interface RegisteredShortcut {
  id: string;
  keys: string[];
  label?: string | undefined;
  description?: string | undefined;
  category?: string | undefined;
  order?: number | undefined;
}

interface Shortcut {
  handler: Handler;
  usingInput?: boolean | string | undefined;
}

const isApplePlatform = () =>
  typeof navigator !== "undefined" && /Mac|iP/.test(navigator.userAgent);

const getKeySymbol = (norm: string): string | undefined => {
  const mac = isApplePlatform();
  switch (norm) {
    case "ctrl":
      return "Ctrl";
    case "meta":
      return mac ? "⌘" : "Ctrl";
    case "alt":
      return mac ? "⌥" : "Alt";
    case "shift":
      return mac ? "⇧" : "Shift";
    case "enter":
      return "↵";
    case "delete":
      return "⌦";
    case "backspace":
      return "⌫";
    case "escape":
      return "Esc";
    case "tab":
      return "⇥";
    case "space":
      return "Space";
    case "arrowup":
      return "↑";
    case "arrowdown":
      return "↓";
    case "arrowleft":
      return "←";
    case "arrowright":
      return "→";
    default:
      return undefined;
  }
};

const MODS: Record<string, string> = {
  cmd: "meta",
  command: "meta",
  control: "ctrl",
  opt: "alt",
  option: "alt",
};

export const normalizeModifier = (m: string) => MODS[m.toLowerCase()] || m.toLowerCase();

export const formatShortcutKeys = (k: string): string[] =>
  k.split(/[_-]/).map((p) => {
    const norm = normalizeModifier(p);
    return getKeySymbol(norm) ?? (p ? p[0]!.toUpperCase() + p.slice(1) : "");
  });

export const [activeShortcutsStore, setActiveShortcutsStore] = createStore<RegisteredShortcut[]>(
  [],
);

export const [shortcutsModalOpen, setShortcutsModalOpen] = createSignal(false);
export const openShortcutsModal = () => setShortcutsModalOpen(true);
export const closeShortcutsModal = () => setShortcutsModalOpen(false);
export const toggleShortcutsModal = () => setShortcutsModalOpen((open) => !open);

const isUsingInput = (el: Element | null): boolean | string => {
  const target = (el?.shadowRoot?.activeElement || el) as HTMLElement | null;
  return target && (/INPUT|TEXTAREA|SELECT/.test(target.tagName) || target.isContentEditable)
    ? target.getAttribute("name") || true
    : false;
};

const isEnabled = (s: Shortcut, input: boolean | string) =>
  s.usingInput === true || (s.usingInput ? input === s.usingInput : !input);

const normalizeCombo = (combo: string) => {
  const parts = combo.toLowerCase().split("_");
  let meta = "";
  let ctrl = "";
  let alt = "";
  let shift = "";
  for (let i = 0; i < parts.length - 1; i++) {
    const m = MODS[parts[i]!] || parts[i]!;
    if (m === "meta") meta = "meta_";
    else if (m === "ctrl") ctrl = "ctrl_";
    else if (m === "alt") alt = "alt_";
    else if (m === "shift") shift = "shift_";
  }
  return `${meta}${ctrl}${alt}${shift}${parts[parts.length - 1] || ""}`;
};

export function defineShortcuts(
  config: ShortcutsConfig,
  options: ShortcutsOptions = {},
): () => void {
  if (typeof window === "undefined") return () => {};

  const map = new Map<string, Shortcut>();
  const reg: RegisteredShortcut[] = [];

  for (const [k, cfg] of Object.entries(config)) {
    if (!cfg) continue;
    const obj = typeof cfg === "object" ? cfg : null;
    const handler = obj ? obj.handler : cfg;
    if (typeof handler !== "function") continue;

    const key =
      k.includes("-") && k !== "-" && !k.includes("_") ? k.toLowerCase() : normalizeCombo(k);
    map.set(key, { handler, usingInput: obj?.usingInput });

    if (obj?.label || obj?.description) {
      reg.push({
        id: `${obj.category || "system"}-${k}`,
        keys: formatShortcutKeys(k),
        category: obj.category || "system",
        label: obj.label,
        description: obj.description,
        order: obj.order,
      });
    }
  }

  const ids = new Set(reg.map((i) => i.id));
  if (ids.size) {
    setActiveShortcutsStore((draft) => {
      for (let i = draft.length - 1; i >= 0; i--) {
        if (ids.has(draft[i]!.id)) draft.splice(i, 1);
      }
      draft.push(...reg);
    });
  }

  const buffer: string[] = [];
  let timer: ReturnType<typeof setTimeout> | undefined;

  const onKeyDown = (e: KeyboardEvent) => {
    if (!e.key || e.isComposing) return;
    const key = e.key === " " ? "space" : e.key.toLowerCase();
    const codeKey = e.code
      ? e.code
          .replace(/^Key/, "")
          .replace(/^Digit/, "")
          .toLowerCase()
      : "";
    const input = isUsingInput(typeof document !== "undefined" ? document.activeElement : null);

    buffer.push(key);
    if (buffer.length > 2) buffer.shift();
    clearTimeout(timer);

    // Chained sequence check (e.g. g-d)
    if (buffer.length === 2) {
      const chainedMatch = map.get(buffer.join("-"));
      if (chainedMatch && isEnabled(chainedMatch, input)) {
        e.preventDefault();
        chainedMatch.handler(e);
        buffer.length = 0;
        return;
      }
    }

    // Unified event normalization
    const keysToCheck = Array.from(new Set([key, codeKey].filter(Boolean)));
    const mac = isApplePlatform();
    for (const k of keysToCheck) {
      const sig = `${e.metaKey ? "meta_" : ""}${e.ctrlKey ? "ctrl_" : ""}${e.altKey ? "alt_" : ""}${e.shiftKey ? "shift_" : ""}${k}`;
      const primarySig =
        !mac && e.ctrlKey && !e.metaKey
          ? `meta_${e.altKey ? "alt_" : ""}${e.shiftKey ? "shift_" : ""}${k}`
          : sig;

      const match = map.get(sig) || map.get(primarySig) || map.get(k);
      if (match && isEnabled(match, input)) {
        e.preventDefault();
        match.handler(e);
        buffer.length = 0;
        return;
      }
    }

    timer = setTimeout(() => void (buffer.length = 0), options.chainDelay ?? 800);
  };

  window.addEventListener("keydown", onKeyDown);
  return () => {
    window.removeEventListener("keydown", onKeyDown);
    clearTimeout(timer);
    if (ids.size) {
      setActiveShortcutsStore((draft) => {
        for (let i = draft.length - 1; i >= 0; i--) {
          if (ids.has(draft[i]!.id)) draft.splice(i, 1);
        }
      });
    }
  };
}
