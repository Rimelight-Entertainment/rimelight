import { createMemo, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { CommandPaletteProps } from "./command-palette"
import { commandPaletteTheme } from "./command-palette.theme"

export interface RLCommandPaletteProps extends CommandPaletteProps {
  children?: JSX.Element
}

const RLCommandPalette: Component<RLCommandPaletteProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "ui", "class", "children")

  const resolvedClasses = createMemo(() =>
    commandPaletteTheme({
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export { RLCommandPalette }
