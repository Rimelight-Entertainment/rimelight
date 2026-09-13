import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { InputTagsProps } from "./input-tags"
import { inputTagsTheme } from "./input-tags.theme"

export interface RLSInputTagsProps extends InputTagsProps {
  children?: JSX.Element
}

const RLSInputTags: Component<RLSInputTagsProps> = (allProps) => {
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
    inputTagsTheme({
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

export default RLSInputTags
