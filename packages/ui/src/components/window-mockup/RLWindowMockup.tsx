import { createMemo, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { WindowMockupProps } from "./window-mockup"
import { windowMockupTheme } from "./window-mockup.theme"

export interface RLWindowMockupProps extends WindowMockupProps {
  children?: JSX.Element
}

const RLWindowMockup: Component<RLWindowMockupProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "ui", "class", "children")

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

export { RLWindowMockup }
export default RLWindowMockup
