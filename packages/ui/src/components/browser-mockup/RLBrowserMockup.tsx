import { createMemo, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { BrowserMockupProps } from "./browser-mockup"
import { browserMockupTheme } from "./browser-mockup.theme"

export interface RLBrowserMockupProps extends BrowserMockupProps {
  children?: JSX.Element
}

const RLBrowserMockup: Component<RLBrowserMockupProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "ui", "class", "children")

  const resolvedClasses = createMemo(() => browserMockupTheme({ ui: props.ui, class: props.class }))

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export { RLBrowserMockup }
export default RLBrowserMockup
