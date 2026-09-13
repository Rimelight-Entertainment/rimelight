import {
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  splitProps,
  type Component,
  type JSX
} from "solid-js"
import type { ThemeSelectorProps } from "./theme-selector"
import { themeSelectorTheme } from "./theme-selector.theme"
import RLSSelect from "../select/RLSSelect"
import RLSIcon from "../icon/RLSIcon"
import { defineShortcuts } from "../../shortcuts"

export interface RLSThemeSelectorProps extends ThemeSelectorProps {
  children?: JSX.Element
  onChange?: (theme: string) => void
}

const themeItems = [
  { label: "System", value: "system", icon: "i-lucide-laptop" },
  { label: "Light", value: "light", icon: "i-rl-sun" },
  { label: "Dark", value: "dark", icon: "i-rl-moon" }
]

const RLSThemeSelector: Component<RLSThemeSelectorProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "mode",
    "size",
    "theme",
    "ui",
    "class",
    "children",
    "onChange"
  ])

  const [currentPreference, setCurrentPreference] = createSignal<string>("system")

  const getPreference = () => {
    if (typeof localStorage === "undefined") return "system"
    const stored = localStorage.getItem("theme")
    return stored === "system" || stored === "light" || stored === "dark" ? stored : "system"
  }

  const applyTheme = (next: string) => {
    setCurrentPreference(next)
    if (typeof document !== "undefined") {
      const resolved =
        next === "system"
          ? typeof window !== "undefined" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : next
      document.documentElement.setAttribute("data-theme", resolved)
      localStorage.setItem("theme", next)
    }
    props.onChange?.(next)
  }

  onMount(() => {
    const pref = getPreference()
    applyTheme(pref)

    const cycle = () => {
      const cur = currentPreference()
      const next = cur === "system" ? "light" : cur === "light" ? "dark" : "system"
      applyTheme(next)
    }

    const cleanupShortcut = defineShortcuts({
      meta_alt_t: {
        handler: cycle,
        label: "Cycle Theme",
        description: "Cycle between system, light, and dark theme mode",
        category: "system"
      }
    })

    onCleanup(() => cleanupShortcut())
  })

  const mode = () => props.mode || "select"
  const size = () => props.size || "md"

  const resolvedClasses = createMemo(() =>
    themeSelectorTheme({
      ui: props.ui,
      class: props.class
    })
  )

  const activeIcon = () => {
    const pref = currentPreference()
    if (pref === "light") return "i-rl-sun"
    if (pref === "dark") return "i-rl-moon"
    return "i-lucide-laptop"
  }

  return (
    <div
      class={resolvedClasses().root}
      data-theme-selector
      data-mode={mode()}
      data-theme={props.theme}
      data-theme-preference={currentPreference()}
      {...rest}
    >
      <div class={resolvedClasses().wrapper}>
        <RLSSelect
          items={themeItems}
          value={currentPreference()}
          onChange={(e) => applyTheme(e.currentTarget.value)}
          size={size() as any}
          variant={mode() === "icon" ? "icon" : "default"}
          aria-label="Toggle theme"
          class={resolvedClasses().select}
          leading={
            <span class="flex items-center">
              <RLSIcon name={activeIcon()} class="size-4" />
            </span>
          }
        />
      </div>
      {props.children}
    </div>
  )
}

export default RLSThemeSelector
