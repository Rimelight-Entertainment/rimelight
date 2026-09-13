import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { LogoProps } from "./logo"
import { logoTheme } from "./logo.theme"

export interface RLSLogoProps extends LogoProps {
  children?: JSX.Element
}

const RLSLogo: Component<RLSLogoProps> = (allProps) => {
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
    logoTheme({
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

export default RLSLogo
