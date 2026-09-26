import { createMemo, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import { Dynamic } from "@solidjs/web"
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

  if (props.as) {
    return (
      <Dynamic
        component={props.as}
        class={`${resolvedClasses().root} rl-main-container`}
        data-slot="main"
        {...rest}
      >
        {props.children}
      </Dynamic>
    )
  }

  return (
    <main
      class={`${resolvedClasses().root} rl-main-container`}
      data-slot="main"
      {...rest}
    >
      {props.children}
    </main>
  )
}

export { RLMain }
export default RLMain
