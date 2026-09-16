import { onMount, onCleanup, type Component, type JSX } from "solid-js"

export interface RLSHeadProps {
  transitions?: boolean
  children?: JSX.Element
}

const RLSHead: Component<RLSHeadProps> = (_allProps) => {
  const getThemePreference = (): "dark" | "light" => {
    if (typeof localStorage === "undefined") return "light"
    const stored = localStorage.getItem("theme")
    if (stored === "dark" || stored === "light") return stored
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches
    return dark ? "dark" : "light"
  }

  const applyTheme = () => {
    if (typeof document === "undefined") return
    document.documentElement.setAttribute("data-theme", getThemePreference())
  }

  onMount(() => {
    applyTheme()

    const mql = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      if (localStorage.getItem("theme") === "system") applyTheme()
    }

    mql.addEventListener("change", onChange)
    onCleanup(() => mql.removeEventListener("change", onChange))
  })

  return null
}

export default RLSHead
