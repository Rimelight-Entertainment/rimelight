import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { FieldsetProps } from "./fieldset"
import { fieldsetTheme } from "./fieldset.theme"

export interface RLFieldsetProps extends FieldsetProps {
  children?: JSX.Element
}

const RLFieldset: Component<RLFieldsetProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    fieldsetTheme({
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export { RLFieldset }
export default RLFieldset
