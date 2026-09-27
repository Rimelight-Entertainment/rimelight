import { createMemo, omit, type Component } from "solid-js"
import { dynamic, type JSX } from "@solidjs/web"
import type { MainProps } from "./main"
import { mainTheme } from "./main.theme"

export interface RLMainProps extends MainProps {
  children?: JSX.Element
}

const RLMain: Component<RLMainProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "as", "ui", "class", "children")

  const resolvedClasses = createMemo(() =>
    mainTheme({
      ui: props.ui,
      class: props.class
    })
  )

  // Hoisted per instance (<Dynamic> is deprecated: it rebuilds a fresh
  // factory at every call site). Collapses the old if/else into one return.
  const MainTag = dynamic(() => props.as ?? "main")

  return (
    <MainTag class={`${resolvedClasses().root} rl-main-container`} data-slot="main" {...rest}>
      {props.children}
    </MainTag>
  )
}

export { RLMain }
