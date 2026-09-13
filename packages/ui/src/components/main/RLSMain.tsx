import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import { Dynamic } from "solid-js/web"
import type { MainProps } from "./main"
import { mainTheme } from "./main.theme"

export interface RLSMainProps extends MainProps {
  children?: JSX.Element
}

const RLSMain: Component<RLSMainProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["as", "ui", "class", "children"])

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
      class={`${resolvedClasses().root}  rla-main-container`}
      data-slot="main"
      {...rest}
    >
      {props.children}
      <style>{`
        .rla-main-container {
          padding-top: var(--rl-total-header-height, 4rem);
        }
      `}</style>
    </Dynamic>
  )
}

export default RLSMain
