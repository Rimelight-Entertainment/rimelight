import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { WindowMockupProps } from "./window-mockup"
import { windowMockupTheme } from "./window-mockup.theme"

export interface RLSWindowMockupProps extends WindowMockupProps {
  children?: JSX.Element
}

const RLSWindowMockup: Component<RLSWindowMockupProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    windowMockupTheme({
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

export default RLSWindowMockup
