import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { BrowserMockupProps } from "./browser-mockup"
import { browserMockupTheme } from "./browser-mockup.theme"

export interface RLBrowserMockupProps extends BrowserMockupProps {
  children?: JSX.Element
}

const RLBrowserMockup: Component<RLBrowserMockupProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() => browserMockupTheme({ ui: props.ui, class: props.class }))

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export { RLBrowserMockup }
export default RLBrowserMockup
