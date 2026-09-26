import { createMemo, omit, type Component } from "solid-js"
import { resolveIcon } from "../../icons"
import type { IconProps } from "./icon"
import { iconTheme } from "./icon.theme"

export interface RLIconProps extends IconProps {}

const RLIcon: Component<RLIconProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "name", "size", "ui", "class")
  const resolved = createMemo(() => resolveIcon(props.name))
  const classes = createMemo(() =>
    iconTheme({
      size: props.size ?? "md",
      ui: props.ui,
      class: props.class
    })
  )
  return (
    <span
      class={resolved().isClass ? `${classes().root} ${resolved().content}` : classes().root}
      data-slot="icon"
      aria-hidden="true"
      {...(!resolved().isClass ? { innerHTML: resolved().content } : {})}
      {...rest}
    />
  )
}

export { RLIcon }
export default RLIcon
