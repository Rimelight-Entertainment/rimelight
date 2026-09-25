import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { FooterProps } from "./footer"
import { footerTheme } from "./footer.theme"

export interface RLFooterProps extends FooterProps {
  left?: JSX.Element
  center?: JSX.Element
  right?: JSX.Element
  children?: JSX.Element
}

const RLFooter: Component<RLFooterProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "contain",
    "theme",
    "ui",
    "class",
    "left",
    "center",
    "right",
    "children"
  ])

  const resolvedClasses = createMemo(() =>
    footerTheme({
      contain: props.contain,
      theme: props.theme,
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <footer
      class={resolvedClasses().root}
      data-slot="root"
      data-contain={props.contain ? "true" : "false"}
      data-theme={props.theme}
      {...rest}
    >
      <div class={resolvedClasses().container} data-slot="container">
        <div class={resolvedClasses().left} data-slot="left">
          {props.left}
        </div>
        <div class={resolvedClasses().center} data-slot="center">
          {props.center}
        </div>
        <div class={resolvedClasses().right} data-slot="right">
          {props.right}
        </div>
      </div>
    </footer>
  )
}

export { RLFooter }
export default RLFooter
