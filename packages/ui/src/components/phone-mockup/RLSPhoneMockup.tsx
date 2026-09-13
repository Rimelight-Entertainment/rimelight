import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { PhoneMockupProps } from "./phone-mockup"
import { phoneMockupTheme } from "./phone-mockup.theme"

export interface RLSPhoneMockupProps extends PhoneMockupProps {
  children?: JSX.Element
}

const RLSPhoneMockup: Component<RLSPhoneMockupProps> = (allProps) => {
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

export default RLSPhoneMockup
