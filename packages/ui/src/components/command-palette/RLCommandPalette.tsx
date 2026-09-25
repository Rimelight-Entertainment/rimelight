import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { CommandPaletteProps } from "./command-palette"
import { commandPaletteTheme } from "./command-palette.theme"

export interface RLCommandPaletteProps extends CommandPaletteProps {
  children?: JSX.Element
}

const RLCommandPalette: Component<RLCommandPaletteProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

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
export default RLCommandPalette
