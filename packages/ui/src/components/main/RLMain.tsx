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

  const tag = () => props.as ?? "main"

  const resolvedClasses = createMemo(() =>
    mainTheme({
      hasContent: props.children !== undefined,
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <Dynamic
      component={tag()}
      class={`${resolvedClasses().root}  rl-main-container`}
      data-slot="main"
      {...rest}
    >
      {props.children}
      <style>{`
        .rl-main-container {
          padding-top: var(--rl-total-header-height, 4rem);
        }
      `}</style>
    </Dynamic>
  )
}

export { RLMain }
export default RLMain
