import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { ThemeSelectorProps } from "./theme-selector"
import { themeSelectorTheme } from "./theme-selector.theme"

export interface RLSThemeSelectorProps extends ThemeSelectorProps {
  children?: JSX.Element
}

const RLSThemeSelector: Component<RLSThemeSelectorProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "ui",
    "class",
    "children",
    "checked",
    "disabled",
    "name",
    "label",
    "value",
    "trailing"
  ])

  const resolvedClasses = createMemo(() =>
    themeSelectorTheme({
      ui: props.ui,
      class: props.class,
      ...allProps
    })
  )

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export default RLSThemeSelector
