import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { AppProps } from "./app"
import { appTheme } from "./app.theme"

export interface RLSAppProps extends AppProps {
  children?: JSX.Element
}

const RLSApp: Component<RLSAppProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() => appTheme({ ui: props.ui, class: props.class }))

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export default RLSApp
