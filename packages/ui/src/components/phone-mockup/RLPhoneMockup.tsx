import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { PhoneMockupProps } from "./phone-mockup"
import { phoneMockupTheme } from "./phone-mockup.theme"

export interface RLPhoneMockupProps extends PhoneMockupProps {
  children?: JSX.Element
}

const RLPhoneMockup: Component<RLPhoneMockupProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    phoneMockupTheme({
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

export { RLPhoneMockup }
export default RLPhoneMockup
